function getDefaultRules(){
	return [{
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
}

angular
.module('app', ['ui.ace'])
.service('StorageService', function(){
	var that = this;
	this.data = {};
	this.load = function(cb){
		chrome.storage.local.get({data: true}, function(response) {
			if(response && typeof response.data === 'object' && response.data.rules){
				console.log(response.data.rules);
				that.data = response.data;
			}else{
				that.data = {
					rules: getDefaultRules()
				};
			}
		    cb(that.data);
	     });
	}
	
	this.save = function(){
		that.data.rules.forEach(function(rule, i){
			rule.id = i;
		});
		chrome.storage.local.set({'data': that.data}, function() {});
	};
})
.controller('WrapCtrl', function($scope, StorageService){
	$scope.export = function(){
		var myWindow = window.open("", "MsgWindow", "width=800,height=600");
		myWindow.document.write(JSON.stringify($scope.data));
	};
	$scope.import = function(){
		var dataToImport = window.prompt('paste data');
		try {
			var data = JSON.parse(dataToImport);
			if(typeof data === 'object' && data.rules && Array.isArray(data.rules)){
				$scope.data.rules = data.rules;
			}
		}catch(e){
			console.log('failed to parse');
		}
	};
	$scope.setDefaultRules = function(){
		$scope.data.rules = getDefaultRules();
	};

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