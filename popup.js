let currentWhitelist;

window.addEventListener("load", () => {
    const addToWhitelist = document.getElementById("addToWhitelist");
    const removeFromWhiteList = document.getElementById("removeFromWhiteList");
    const switchToWhitelistMode = document.getElementById("switchToWhiteListMode");
    const switchToMutedMode = document.getElementById("switchToMutedMode");
    const switchToDisabledMode = document.getElementById("switchToDisabledMode");
    const switchToAudibleWhitelist = document.getElementById("switchToWhitelistAudibleOnly");

    const updateButtonsState = () => {
        chrome.runtime.sendMessage({type: "isTabWhitelisted"}, result => {
            console.log("We got response ", result);
            addToWhitelist.style.display = result ? 'none' : '';
            removeFromWhiteList.style.display = result === false ? 'none' : '';
        });
    };

    updateButtonsState();

    addToWhitelist.addEventListener("click", () => {
        chrome.runtime.sendMessage({type: "whitelist"});
        updateButtonsState();
    });
    removeFromWhiteList.addEventListener("click", () => {
        chrome.runtime.sendMessage({type: "whitelist"});
        updateButtonsState();
    });


    const updateSwitchModeButtons = modeName => {
        switchToDisabledMode.style.display = modeName !== "disable" ? '' : "none";
        switchToWhitelistMode.style.display = modeName !== "whitelist" ? '' : 'none';
        switchToMutedMode.style.display = modeName !== "muteall" ? '' : 'none';
        switchToAudibleWhitelist.style.display = modeName !== "whitelist-audible" ? '' : 'none';
    };

    chrome.runtime.sendMessage({type: "getCurrentMode"}, ({mode, whitelist}) => {
        updateSwitchModeButtons(mode);
        currentWhitelist = whitelist;
    });

    const switchToMode = modeName => {
        return () => {
            chrome.runtime.sendMessage({type: "switchMode", payload: modeName});
            updateSwitchModeButtons(modeName);
        };
    };
    switchToWhitelistMode.addEventListener("click", switchToMode("whitelist"));
    switchToMutedMode.addEventListener("click", switchToMode("muteall"));
    switchToDisabledMode.addEventListener("click", switchToMode("disable"));
    switchToAudibleWhitelist.addEventListener("click", switchToMode("whitelist-audible"));

});