	//configure communication managers
	var pageCommunicationManager = new CommunicationManager('pageCommunicationManager', function(cmInstance){
		window.addEventListener('message', function(event){
			cmInstance.onMessageReceived(event.data);
		});
		cmInstance.onMessageSend(function(data){
			window.postMessage(data, '*');
		});
	});

	var popupCommunicationManager = new CommunicationManager('popupCommunicationManager', function(cmInstance){
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			cmInstance.onMessageReceived(request);
		});
		cmInstance.onMessageSend(function(data){
			chrome.runtime.sendMessage(data, function(){});
		});
	});

	//communication manager api
	var cm = {
		page: pageCommunicationManager,
		popup: popupCommunicationManager
	};
		
	function onScriptsLoaded() {
		var actionManager, communicationProtocol;

		actionManager = scriptManager.generateActionManager();
		if(!actionManager)return;

		communicationProtocol = {
			'HELLO': function(){
				var actions = actionManager.getList();
				cm.popup.send({type: 'REGISTER_ACTIONS', actions: actions});
			},
			'CALL_ACTION': function(data){
				if(!data.action)return;
				var action = actionManager.getByName(data.action);
				cm.page.send({type: 'CALL_ACTION', action: action});
			}
		};

		cm.popup.onMessage(function(data, respond) {
			data && data.type && communicationProtocol[data.type](data, respond);
		});
	 
		loadScript('CommunicationManager.js', function(){
			loadScript('page_script.js');
		});
		
	}

 
//=================================================================================================
function loadScript(url, cb){
			var injectScript = document.createElement('script');
			injectScript.src = chrome.extension.getURL(url);			
			injectScript.onload = function() {
				cb && cb();
			  this.parentNode.removeChild(this);		  
			};			
			(document.head || document.documentElement).appendChild(injectScript);	
}


//=================================================================================================
function ActionManager(){
	var actionList = [];
	function getList(){
		return actionList;
	}
	function addAction(action){
		actionList.push(action);
	}
	function getByName(name){
		return actionList.find(function(action){
			return action.name === name;
		});
	}
	return {
		addAction: addAction,
		getByName: getByName,
		getList: getList
	};
}

//=================================================================================================
function ScriptsManager(validRules){}

ScriptsManager.prototype.load = function(cb){
	var that = this;
	chrome.storage.local.get({data: true}, function(response){
		if(!response.data || !response.data.rules)return;
		that.data = response.data;
		cb(that.data);
	});
};


ScriptsManager.prototype.getAvailableScripts = function(){
		var validRules = this.data.rules.filter(function(rule){
			if(rule.urlPattern === '*'){
				return true;
			}
			var regExp = new RegExp(rule.urlPattern);
			return regExp.exec(location.href);			
		});
		return (validRules.length > 0) ? validRules : null;
};


ScriptsManager.prototype.generateActionManager = function(){
				var validRules, actionManager, unnamedActionIndex = 0, wrapper = '(function(){ %script% })()';
				validRules = this.getAvailableScripts();

				if(!validRules || validRules.length === 0) return;
				
				actionManager = new ActionManager();

					function registerAction(action){
						actionManager.addAction({
							name: action.description || action.name || 'unnamedAction'+(++unnamedActionIndex),
							fn: action+''
						});
					}

				validRules.forEach(function(validRule){
			  		result = eval(wrapper.replace('%script%', validRule.script));
				  	if(result){
				  		if(typeof result === 'function'){
				  			registerAction(result);
				  		}
				  		if(Array.isArray(result)){
				  			result.forEach(registerAction);
				  		}
				  	}  	
			  });
			  return actionManager;	
};




	var scriptManager = new ScriptsManager();
	scriptManager.load(onScriptsLoaded);

	