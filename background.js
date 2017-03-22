var whitelist = new Set();
whitelist.add("stackoverflow.com");


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    //mute condition
    if (!changeInfo.url) {
        return;
    }


    //FIXME compare domain correctly
    var isInWhiteList = false;


    for (let domain of whitelist) {
        if (changeInfo.url.indexOf(domain) > -1) {
            isInWhiteList = true;
            break;
        }
    }

    if (isInWhiteList) {
        if (tab.mutedInfo &&
            tab.mutedInfo.muted
            && tab.mutedInfo.extensionId === chrome.runtime.id
        ) {
            chrome.tabs.update(tabId, {muted: false});
        }
        return;
    }


    if (!tab.mutedInfo
        || !tab.mutedInfo.muted
    ) {
        chrome.tabs.update(tabId, {muted: true});
    }

});
