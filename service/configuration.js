const operateCons = require("./config/constants.json"); 
var serviceConfig = require("./config/serviceConfig"); 

var componentConfig = require('./config/componentConfig.json');
var groupConfig = require('./config/groupConfig.json');

function configuration(sGroupConfigFile){

}

configuration.prototype.getTableDependency = function(){
	return;
	var a =
	[
		{
		  "UJA_APPL": {
		    "primaryKeys": [
		      "MANDT",
		      "APPSET_ID",
		      "APPLICATION_ID"
		    ],
		    "foreignKeys": [
		      {
		        "referenceTable": "UJA_APPSETT",
		        "foreignKey": [
		          {
		            "column": "MANDT",
		            "referenceColumn": "MANDT"
		          },
		          {
		            "column": "APPSET_ID",
		            "referenceColumn": "APPSET_ID"
		          }
		        ]
		      }
		    ],
		    "cacheDataColumnKeys":[
		    	[
		    		"MANDT",
		    		"APPSET_ID",
		    		"APPLICATION_ID"
		    	]		    	
		    ]
		  }
		}
	];
};


configuration.prototype.validateComponent = function(oGroupConfig,componentConfig){
	var oComponents = prepareComponent(oGroupConfig,componentConfig);

	var aComponents = [];

	for(sComponentName in oComponents){
		if(oComponents[sComponentName]["checked"] === false){
			if(oComponents[sComponentName].dependencies){
				let iLength = oComponents[sComponentName].dependencies.length;
				for(let iIndex=0; iIndex<iLength; iIndex++){
					let oDependedCom = oComponents[oComponents[sComponentName].dependencies[iIndex]];
					if(oDependedCom){
						if(oDependedCom["checked"] === false ){
							//TBD
						}
					}else{
						console.log("Depended Component " + oComponents[sComponentName].dependencies[iIndex] + " does not exist");	        		
	        			return false;
					}
				}
			}
		}
	}
};

//only collect components that is configured kept, but are not validated based on dependency
configuration.prototype.prepareComponent = function(oGroupConfig,componentConfig){
	let bCorrect = checkDependency(oGroupConfig,componentConfig);
	if(bCorrect === false){
		return false;
	}
	
	let oComponents = {};
	for(sComponentName in componentConfig){
		if(componentConfig.hasOwnProperty(sComponentName)){
			oComponents[sComponentName] = {};
			oComponents[sComponentName].dependencies = componentConfig.dependencies;
			oComponents[sComponentName]["keep"] = defaultOperator;
		}
	}

	for(sGroupName in oGroupConfig.groupDefination){
		if(oGroupConfig.groupDefination.hasOwnProperty(sGroupName)){		
			let oGroupDefination = oGroupConfig.groupDefination[sGroupName];
			let bKeepInFile = oGroupDefination.keepInFile;			
			let iCompCount = oGroupDefination.components.length;
			for(let iIndex=0; iIndex<iCompCount; iIndex++){
				sComName = oGroupDefination.components[iIndex];
				if(!componentConfig[sComName]){
					console.log("Component " + sComName + " does not exist which is defined in group " + sGroupName);	        		
	        		return false;
				}

				let bKeep = bKeepInFile ? operateCons.OPERATE.KEEP : operateCons.OPERATE.REMOVE;
				oComponents[sComName]["keep"] = bKeep;				
			}
		}
	}

	for(sComponentName in oComponents){
		if(oComponents[sComName]["keep"] === operateCons.OPERATE.REMOVE){
			delete oComponents[sComName];
		}	
	}
};


//check one component can be kept only if all its dependency are kept
configuration.prototype.checkComKeepDepd = function(oComponents, sComName, iIndex){

};

//check if the groupConfig.json has cycle dependency
configuration.prototype.checkDependency = function(oGroupConfig, componentConfig){
	//TBD
	return true;
};

configuration.prototype.getTablesOperate = function(){
	return oTablesOperate;
};

configuration.prototype.getDefaultOperate = function(){
	return defaultOperator;
};

configuration.prototype.init = function(){
	//check component dependency
	//filter component according to groupConfig
	//check inconsistent between component dependency and table foreign key, 	
		//if one table does not belong to any component, log the table name and report error
	//merge the tableConfig and variableConfig so that all tables can be put together to calculate ordr and check if still need cache
		//if we find user,team is filtered, then we do not need merge user and team
	//generate table dependency according to component dependency and table foreign key
	//collect fileservice folder related infomation
	//generate valid fileservice pattern
	var sGroupConfigName = serviceConfig.appliedGroupConfigName;
	var oTablesOperate = {};

	var oGroupConfig = groupConfig[sGroupConfigName];
	var defaultOperator = oGroupConfig.defaultKeepInFile ? operateCons.OPERATE.KEEP : operateCons.OPERATE.REMOVE;

	for(sGroupName in oGroupConfig.groupDefination){
		if(oGroupConfig.groupDefination.hasOwnProperty(sGroupName)){
		// if(oGroupConfig.groupDefination.hasOwnProperty(sGroupName) && oGroupConfig.groupDefination.keepInFile){
			let oGroupDefination = oGroupConfig.groupDefination[sGroupName];
			let bKeepInFile = oGroupDefination.keepInFile;	
			let iCompCount = oGroupDefination.components.length;
			for(let iIndex=0; iIndex<iCompCount; iIndex++){
				sComName = oGroupDefination.components[iIndex];
				if(!componentConfig[sComName]){
					console.log("Component " + sComName + " does not exist which is defined in group " + sGroupName);
	        		// return;
	        		continue;
				}
				let iTableCount = componentConfig[sComName].tables ? componentConfig[sComName].tables.length : 0;
				for(iTableIndex=0; iTableIndex<iTableCount; iTableIndex++){
					oTablesOperate[componentConfig[sComName].tables[iTableIndex]] = bKeepInFile ? operateCons.OPERATE.KEEP : operateCons.OPERATE.REMOVE;
				}
			}
		}
	}
};

exports.configuration = configuration;