const operateCons = require("./config/constants.json"); 
var serviceConfig = require("./config/serviceConfig"); 

var componentConfig = require('./config/componentConfig.json');
var groupConfig = require('./config/groupConfig.json');

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

var getTablesOperate = function(){
	return oTablesOperate;
}

var getDefaultOperate = function(){
	return defaultOperator;
}

exports.getTablesOperate = getTablesOperate;
exports.getDefaultOperate = getDefaultOperate;