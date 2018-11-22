const operateCons = require("./config/constants.json"); 
var serviceConfig = require("./config/serviceConfig"); 

var componentConfig = require('./config/componentConfig.json');
var groupConfig = require('./config/groupConfig.json');


function getBasicTypeId(){
	return  {
		"%APPSETID%" : "UJA_APPL"
	};
}

//internal data
// {
//   "UJA_APPL": {  		
// 	  	"referencedByTables":[
// 	  	],
// 	  	"isBasicData":true	  
//   	},  	
// }



function validateComponent(oGroupConfig,componentConfig){
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
}

//only collect components that is configured kept, but are not validated based on dependency
function prepareComponent(oGroupConfig,componentConfig){
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
}


//check one component can be kept only if all its dependency are kept
function checkComKeepDepd(oComponents, sComName, iIndex){

}

//check if the groupConfig.json has cycle dependency
function checkDependency(oGroupConfig, componentConfig){
	//TBD
	return true;
}

var getTablesOperate = function(){
	return oTablesOperate;
};

var getDefaultOperate = function(){
	return defaultOperator;
};

var init = function(){
	//check component dependency
	//filter component according to groupConfig
	//check inconsistent between component dependency and table foreign key, 	
		//if one table does not belong to any component, log the table name and report error
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



exports.getTablesOperate = getTablesOperate;
exports.getDefaultOperate = getDefaultOperate;
exports.tableMetadata = tableMetadata;
exports.getBasicTypeId = getBasicTypeId;