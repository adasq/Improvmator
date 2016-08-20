(function(){
	var contentScriptCommunicationManager = new CommunicationManager('page_script', function(cmInstance){
		window.addEventListener('message', function(event){
			if(!event.data.isExtensifyEvent){
				return;
			}
			cmInstance.onMessageReceived(event.data);
		});
		cmInstance.onMessageSend(function(data){
			window.postMessage(data, '*');
		});
	});

	var communicationProtocol = {
		'CALL_ACTION': function onCallActionMessageReceived(data, respond){
			if(data.type === 'CALL_ACTION'){
				eval('('+data.action.fn+')();');
			}
		}
	};

	contentScriptCommunicationManager.onMessage(function(data, respond){
		data && data.type && communicationProtocol[data.type](data, respond);
	});
})();