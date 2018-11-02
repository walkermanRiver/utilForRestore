const operateCons = require("./config/constants.json"); 

var isRootComplete = function(line){
	//assume that root infomation must be in one line
	line.trim();	
	if(line.startsWith("<AppsetData APPSET_ID=") && line.endsWith(">")){
		return true;
	}else{
		return false;
	}
}

isNextNewTrunk = function(line){
	//assume that one table row must be in one line
	line.trim();
	if(line.startsWith("<UJ") && line.endsWith(">")){
		return true;
	}else{
		return false;
	}
}

exports.isRootComplete = isRootComplete;
exports.isNextNewTrunk = isNextNewTrunk;