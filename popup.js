	
var contentScriptCommunicationManager = new CommunicationManager('contentScriptCommunicationManager', function(cmInstance){
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			cmInstance.onMessageReceived(request);
		});
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			cmInstance.onMessageSend(function(data){
				chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
			});
		});
});

var cm = {
	contentScript: contentScriptCommunicationManager
};

var actionList = document.querySelector('#action-list');

var communicationProtocol = {
	'REGISTER_ACTIONS': function(data){
			if(data.actions.length  === 1){
				callAction(data.actions[0]);					
			}else if(data.actions.length === 0){
				window.open('options.html');
			}else{
				data.actions.forEach(addAction);
			}
	}
};

setTimeout(function(){
	cm.contentScript.send({type: "HELLO"});
	cm.contentScript.onMessage(function(data, respond){
			data && data.type && communicationProtocol[data.type](data, respond);
	});
}, 200);


function callAction(action){
	cm.contentScript.send({type: 'CALL_ACTION', action: action.name}, function(response) {});
	self.close();
}

function addAction(action){
	var wrapElem = document.createElement('li');
	var buttonElem = document.createElement('button');
	buttonElem.appendChild( document.createTextNode(action.name) );
	buttonElem.onclick= function(){
		callAction(action);
	};
	wrapElem.appendChild(buttonElem);
	actionList.appendChild(wrapElem);
}
