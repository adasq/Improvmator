	function CommunicationManager(name, setupCommunicationLogic){
		this.log = function(){
			var args = Array.prototype.splice.call(arguments, 0);
			args.unshift(name);
			console.log.apply(console, args);
		};
		this.id = name;
		this.onMessageCallback = function(){};
		this.registeredActions = {};
		setupCommunicationLogic(this);
	}

	CommunicationManager.prototype.registerRequest = function(mid, cb){
		this.registeredActions[mid] = cb || function(){};
	};

	CommunicationManager.prototype.onMessage = function(cb){
		this.onMessageCallback = cb;
	};

	CommunicationManager.prototype.onMessageReceived = function(message){
		var that = this;
		if(that.id === message.id){
			return;
		}
		if(this.registeredActions[message.mid]){
			this.registeredActions[message.mid](message.data);
		}else{
			this.onMessageCallback(message.data, function(data){
				that._send({
					id: that.id,
					mid: message.mid,
					data: data,
					isExtensifyEvent: true
				});
			});
		}
	};

	CommunicationManager.prototype.onMessageSend = function(cb){
		this._send = cb;
	};

	CommunicationManager.prototype.send = function(data, cb){
		var that = this, mid = +new Date();
		var request = {
			id: that.id,
			mid: mid,
			data: data || {},
			isExtensifyEvent: true
		};

		this.registerRequest(mid, cb);
		this._send(request);
	};