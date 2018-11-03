const operateCons = require("./config/constants.json"); 

var isRootComplete = function(line){
	//assume that root infomation must be in one line
	let sTrimLine = line.trim();
	if(sTrimLine.startsWith("<AppsetData APPSET_ID=") && sTrimLine.endsWith(">")){
		return true;
	}else{
		return false;
	}
};

var isNextNewTrunk = function(line){
	//assume that one table row must be in one line
	let sTrimLine = line.trim();
	if(sTrimLine.startsWith("<UJ") && sTrimLine.endsWith(">")){
		return true;
	}else{
		return false;
	}
};

var parseTableName = function(line){
	//assume that one table row must be in one line
	//assume that the line has been checked with isNextNewTrunk = true
	let sTrimLine = line.trim();
	// let iLength = sTrimLine.length;
	let sTableName = sTrimLine.slice(1,-1);
	return sTableName;
};

var ifNeedWrite = function(line){
	let sTrimLine = line.trim();
	if(sTrimLine === "</AppsetData>" || 
	   sTrimLine === "<Metadata>" || 
	   sTrimLine === "</Metadata>"){
		return false;
	}else{
		return true;
	}
};

exports.isRootComplete = isRootComplete;
exports.isNextNewTrunk = isNextNewTrunk;
exports.ifNeedWrite = ifNeedWrite;
exports.parseTableName = parseTableName;