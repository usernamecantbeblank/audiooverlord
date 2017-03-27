const whitelist = new Set();

const WHITELIST_MUTE_AUDIBLE = "whitelist-audible";
const WHITELIST_MUTE_ALL = "whitelist"
const MUTE_ALL = "muteall";
const DISABLE = "disable";


var mode = WHITELIST_MUTE_AUDIBLE;

chrome.runtime.onMessage.addListener(({type, payload}, sender, sendResponse) => {
    console.log("message received", type, payload);

    switch (type) {
        case 'switchMode':
            console.log("switch request received", payload);
            switchToMode(payload);
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
            sendResponse({mode, whitelist});
            return true;


        default:
            console.log("Unknown message type");
            break;

    }

});


function switchToMode(modeName) {
    mode = modeName;
    refreshTabsStates();
}

function getCurrentTab(callback) {
    chrome.tabs.query({active: true}, tabs => {
        if (tabs && tabs.length > 0) {
            callback(tabs[0]);
            return;
        }
        callback();
    });
}

chrome.storage.sync.get(itemsObject => {
    Object.keys(itemsObject).forEach(domain => {
        whitelist.add(domain);
    });
    refreshTabsStates();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
        return;
    }
    Object.keys(changes).forEach(domain => {
        const storageChange = changes[key];
        if (!storageChange || !storageChange.newValue) {
            whitelist.delete(domain);
            return
        }
        whitelist.add(domain);
    });


});


function switchToWhitelist(tab) {
    const url = tab.url;
    const domain = extractNormalizedDomain(url);
    if (!whitelist.has(domain)) {
        whitelist.add(domain);
        chrome.storage.sync.set({[domain]: true});
    } else {
        whitelist.delete(domain);
        chrome.storage.sync.remove(domain);
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
    if (tab.mutedInfo &&
        tab.mutedInfo.muted
        && tab.mutedInfo.extensionId !== chrome.runtime.id
    ) {
        return null;
    }


    if (mode === MUTE_ALL) {
        return true;
    }


    if (tab.audible === false && mode === WHITELIST_MUTE_AUDIBLE ||
        mode === DISABLE ||
        isWhitelisted(extractNormalizedDomain(tab.url))) {
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
    if (!changeInfo.audible) {
        return;
    }

    let mute = shouldTabBeMuted(tab);

    if (mute === null) {
        return;
    }
    chrome.tabs.update(tabId, {muted: mute});


});
