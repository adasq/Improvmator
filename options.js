
angular
.module('app', ['ui.ace'])
.service('StorageService', function(){
	var that = this;
	this.data = {};
	this.load = function(cb){
		chrome.storage.local.get({data: true}, function(response) {
			if(response && typeof response.data === 'object' && response.data.rules){
				that.data = response.data;
			}else{
				that.data = {
					rules: [{
						urlPattern: 'x-kom.pl',
						script: 'console.log(111);'
					}]
				};
			}
		    cb(that.data);
	     });
	}
	
	this.save = function(){
		chrome.storage.local.set({'data': that.data}, function() {});
	};
})
.controller('WrapCtrl', function($scope, StorageService){
	$scope.addRule = function(){
		$scope.data.rules.push({
			created: +new Date(),
			script: '//and the code goes here...\nconsole.log(extensify);'
		});
	}
	$scope.aceOption = {
		mode: 'javascript',
		onChange: function(data){
			console.log( data[0] );
		}
	};
	$scope.removeRule = function(rule){
		$scope.data.rules.find( function(_rule, i){
			if(_rule === rule){
				$scope.data.rules.splice(i, 1);
				return true;
			}
		})
	}
	StorageService.load(function(data){
		$scope.data = data;
		$scope.$watch('data.rules', function(nv){
			StorageService.save();
			console.log('saved...')
		}, true);
		$scope.$apply();
	});
});