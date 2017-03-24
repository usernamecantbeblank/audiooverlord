var whitelist = new Set();
var mode = "whitelist";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message received", message);
    const type = message.type;
    switch (type) {
        case 'switchMode':
            console.log("switch request received");
            break;
        case 'whitelist':
            console.log("add to white list request received");
            getCurrentTab(tab => {
                switchToWhitelist(tab);
            });
            break;
        case 'isTabWhitelisted':
            console.log('request sent to whitelist');
            getCurrentTab(tab => {
                let domain = extractNormalizedDomain(tab.url);
                sendResponse(isWhitelisted(domain));
            });
            return true;
        case 'getCurrentMode':
            console.log("request sent to get mode status");
            sendResponse(mode);
            return true;

        default:
            console.log("Unknown message type");
            break;

    }

});

function getCurrentTab(callback) {
    chrome.tabs.query({active: true}, tabs => {
        if (tabs && tabs.length > 0) {
            callback(tabs[0]);
            return;
        }
        callback();
    });
}

chrome.storage.local.get(itemsObject => {
    Object.keys(itemsObject).forEach(domain => {
        whitelist.add(domain);
    });
    refreshTabsStates();
});


function switchToWhitelist(tab) {
    var url = tab.url;
    var domain = extractNormalizedDomain(url);
    if (!whitelist.has(domain)) {
        whitelist.add(domain);
        chrome.storage.local.set({[domain]: true});
    } else {
        whitelist.delete(domain);
        chrome.storage.local.remove(domain);
    }
    refreshTabsStates();
}

function refreshTabsStates() {
    chrome.tabs.query({}, tabs => {
        for (let tab of tabs) {
            if (!tab.url) {
                continue;
            }
            chrome.tabs.update(tab.id, {muted: shouldTabBeMuted(tab)});
        }
    });
}


function isWhitelisted(domainToCheck) {
    return whitelist.has(domainToCheck);
}

//FIXME do a proper parsing later
const element = document.createElement('a');

function extractNormalizedDomain(url) {
    element.href = url;
    return element.host;
}

function shouldTabBeMuted(tab) {
    if (tab.audible === false) {
        return null;
    }

    if (isWhitelisted(extractNormalizedDomain(tab.url))) {
        if (tab.mutedInfo &&
            tab.mutedInfo.muted
            && tab.mutedInfo.extensionId === chrome.runtime.id
        ) {
            return false;
        }
        return null;
    }
    if (tab.mutedInfo &&
        tab.mutedInfo.muted) {
        return null;
    }
    return true;
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    //mute condition
    if (!changeInfo.audible) {
        return;
    }


    let mute = shouldTabBeMuted(tab);

    if (mute === null) {
        return;
    }
    chrome.tabs.update(tabId, {muted: mute});


});
