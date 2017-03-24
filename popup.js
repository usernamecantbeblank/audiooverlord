window.addEventListener("load", () => {
    console.log("We got load");
    let addToWhitelist = document.getElementById("addToWhitelist");
    let removeFromWhiteList = document.getElementById("removeFromWhiteList");
    let switchToWhitelistMode = document.getElementById("switchToWhiteListMode");
    let switchToMutedMode = document.getElementById("switchToMutedMode");
    let switchToDisabledMode = document.getElementById("switchToDisabledMode");

    addToWhitelist.addEventListener("click",()=>{
       chrome.runtime.sendMessage({type:"whitelist"});
    });
    removeFromWhiteList.addEventListener("click",()=>{
        chrome.runtime.sendMessage({type:"whitelist"});
    });

    chrome.runtime.sendMessage({type: "isTabWhitelisted"}, result => {
        console.log("We got response ", result);
        addToWhitelist.style.display = result ? 'none' : '';
        removeFromWhiteList.style.display = result === false ? 'none' : '';
    });
    chrome.runtime.sendMessage({type: "getCurrentMode"}, result => {
        switchToDisabledMode.style.dispay = result !== "disabled" ? '' : "none";
        switchToWhitelistMode.style.display = result !== "whitelist" ? '' : 'none';
        switchToMutedMode.style.displaay = result !== "muted" ? '' : 'none';
    });


});