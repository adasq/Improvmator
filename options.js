var defaulRules = [{
						urlPattern: '(code|docs).angularjs.org',
						script: `//declare action functions and return it as array
//go docs.angularjs.org, and run Improvmator exension icon

var printVersions= function(){
    var selectElem = document.querySelector('.version-picker');
    var scope = angular.element(selectElem).scope();
    alert(scope.docs_versions.length);
};

//you can specify longer action name using description property of function object
printVersions.description = 'Print doc versions list length';

//return list of action-functions
return [
     //when there is no description set to function,
     //the function name will be used
    function angularVersion(){
        alert(angular.version.full);
    },
    printVersions
];`
					}];


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
					rules: defaulRules
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
			script: '//and the code goes here...\n'
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
			chrome.runtime.sendMessage(data);
			console.log('saved...');
		}, true);
		$scope.$apply();
	});
});