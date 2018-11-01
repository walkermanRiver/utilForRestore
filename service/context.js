const operateCons = require("./config/constants.json"); 

var oTableNames = {};
var sAppsetName = null;
var aModelNameList = [];
var aDimensionNameList = [];
var oComponentConfig = null;
var oGroupConfig = null;

var parseXMLInfo = function(config, oResult){
	sAppsetName = oResult.AppsetData.$.APPSET_ID;
    console.log("appsetId is :" + sAppsetName);

    let aMetadata = oResult.AppsetData.Metadata;        
    if(aMetadata.length !== 1){
        console.log("Source XML file error, Metadata has more than one child");
        return;
    }

    let defaultOperate = config.getDefaultOperate();

    let oTables = aMetadata[0];  
    oTablesOperate = config.getTablesOperate();
    collectDDICTableName(oTablesOperate, oTables);
    return oTables;
}

var collectDDICTableName = function(oTablesOperate, oTables, defaultOperate){
	let iCount = Object.getOwnPropertyNames(oTables).length;
    console.log("There are " + iCount + " DDIC tables");

    for(sTableName in oTables){    	
        if(oTables.hasOwnProperty(sTableName)){
        // if(oTables.hasOwnProperty(sTableName) && oTablesOperate[sTableName]){
            if( (!oTablesOperate[sTableName] && defaultOperate === operateCons.OPERATE.KEEP) ||
                (oTablesOperate[sTableName] === operateCons.OPERATE.KEEP) ){
                console.log("kept ddic table name ===> " + sTableName);
                oTableNames[sTableName] = true;
            }else{
                console.log("removed ddic table name ===> " + sTableName);
            }            
        }        
    }
}

var getTableList = function(){
	return oTableNames;
}

exports.parseXMLInfo = parseXMLInfo;
exports.getTableList = getTableList;