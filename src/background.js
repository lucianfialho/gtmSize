(function() {
    chrome.webRequest.onCompleted.addListener(
        (details) => {
            if(details.type == "script" && details.url.indexOf("https://www.googletagmanager.com/gtm.js") != -1) {
                const contentLengthObj = details.responseHeaders.filter((v) => v.name == 'content-length')[0];
                const contentLengthInKb = Math.round(parseInt(contentLengthObj.value) / 1024);

                chrome.action.setBadgeText({
                    text: `${contentLengthInKb.toString()}KB`,
                    tabId: details.tabId
                })
                
                if(sizeByGoogleTagManagerLimit(parseInt(contentLengthObj.value)) < 50) {
                    chrome.action.setBadgeBackgroundColor({
                        color: "green",
                        tabId: details.tabId
                    })
                    return
                }
                
                if(sizeByGoogleTagManagerLimit(parseInt(contentLengthObj.value)) < 69) {
                    chrome.action.setBadgeBackgroundColor({
                        color: "yellow",
                        tabId: details.tabId
                    })
                    return
                }
                
                if(sizeByGoogleTagManagerLimit(parseInt(contentLengthObj.value)) >= 70) {
                    chrome.action.setBadgeBackgroundColor({
                        color: "red",
                        tabId: details.tabId
                    })
                    return
                }
            }
        },
        {urls: ["<all_urls>"]},
        ["responseHeaders"]

    )

    const sizeByGoogleTagManagerLimit = (sizeOfContainer = 0) => {
        // 200KB
        const googleTagManagerSizeLimit = 200  * 1024

        return (sizeOfContainer / googleTagManagerSizeLimit) * 100
    }
}());