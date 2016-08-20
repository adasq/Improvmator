chrome.runtime.onMessage.addListener(function(data) {
    updateRules(data.rules);
});

chrome.storage.local.get({
    data: true
}, function(response) {
    if (response && typeof response.data === 'object' && response.data.rules) {
        updateRules(response.data.rules);
    }
});


function updateRules(rules) {
    var chromeRule = {
        conditions: [],
        actions: [new chrome.declarativeContent.ShowPageAction()]
    };
    rules.forEach(function(ruleDescription) {
        console.log(ruleDescription.urlPattern);
        chromeRule.conditions.push(new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
                urlMatches: ruleDescription.urlPattern
            }
        }));
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([chromeRule]);
    });
}


// setInterval(function(){
//     chrome.declarativeContent.onPageChanged.getRules(undefined,function(rules){
//         console.log(rules)
//     })
// },4000)


//   chrome.runtime.onInstalled.addListener(function(details) {
//     chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//       chrome.declarativeContent.onPageChanged.addRules(chromeRules);
//     });
// });