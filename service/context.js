var oTableNames = {};
var sAppsetName = null;
var aModelNameList = [];
var aDimensionNameList = [];
var oComponentConfig = null;
var oGroupConfig = null;

var parseXMLInfo = function(oResult){
	sAppsetName = oResult.AppsetData.$.APPSET_ID;
    console.log("appsetId is :" + sAppsetName);

    let aMetadata = oResult.AppsetData.Metadata;        
    if(aMetadata.length !== 1){
        console.log("Source XML file error, Metadata has more than one child");
        return;
    }

    let oTables = aMetadata[0];      
    collectDDICTableName(oTables);
    return oTables;
}

var collectDDICTableName = function(oTables){
	let iCount = Object.getOwnPropertyNames(oTables).length;
    console.log("There are " + iCount + " DDIC tables");

    for(sTableName in oTables){    	
        console.log("ddic table name ===> " + sTableName);
        oTableNames[sTableName] = true;
    }
}

var getTableList = function(){
	return oTableNames;
}

exports.parseXMLInfo = parseXMLInfo;
exports.getTableList = getTableList;