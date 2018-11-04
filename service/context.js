const operateCons = require("./config/constants.json"); 

var oTableNames = {};
var oMapTableChunk = {};
var oChunkSize = {};
var sAppsetName = null;
var aModelNameList = [];
var aDimensionNameList = [];
var oComponentConfig = null;
var oGroupConfig = null;
var oAppset = {};

var parseAppsetRoot = function(config, oResult){
};

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
};

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
};

var getTableList = function(){
	return oTableNames;
};

var formatJson = function(aOldData){
    let iTotalRowCount = aOldData[0].Row.length;
    if(iTotalRowCount === 0){
        return null;
    }
    var aRows = [];
    for(let iIndex=0; iIndex<iTotalRowCount; iIndex++){
        let oOldRow = aOldData[0].Row[iIndex];
        aRows.push(oOldRow.$);
    }
    return aRows;

};

var addTableMapping = function(sTableName, sChunkName){
    if(!oMapTableChunk[sTableName]){
        oMapTableChunk[sTableName] = [];
    }
    oMapTableChunk[sTableName].push(sChunkName);
};

var getTableMapping = function(){
    return oMapTableChunk;
}

var addChunkSize = function(sChunkName, iSize){
    oChunkSize[sChunkName] = iSize;
};

var getChunkSize = function(){
    return oChunkSize;
};

exports.parseXMLInfo = parseXMLInfo;
exports.getTableList = getTableList;
exports.formatJson = formatJson;
exports.addTableMapping = addTableMapping;
exports.getTableMapping = getTableMapping;
exports.addChunkSize = addChunkSize;
exports.getChunkSize = getChunkSize;
exports.oAppset = oAppset;