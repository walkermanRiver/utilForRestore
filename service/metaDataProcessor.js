var fs = require('fs'),
	context = require('./context'),
	xml2js = require('xml2js'),
    xmlFileUtil = require('./xmlFileUtility'),    
    config = require('./configuration'),
    readline = require('readline');

const operateCons = require("./config/constants.json");

// function metaDataProcessor(sSourceFileName, sOutPutFolder){
// 	this.sSourceFileName = sSourceFileName;
// 	this.sOutPutFolder = sOutPutFolder;
// }

function preProcessSoureFile(sSourceFileName, sOutPutFolder){

	context.oAppset.sSourceFileName = sSourceFileName;
	context.oAppset.sOutPutFolder = sOutPutFolder;

	var myInterface = readline.createInterface({
	  input: fs.createReadStream(sSourceFileName)
	});

	var iLineNo = 0;
	var iContentCount = 0;
	var iChunkNo = 1;
	var bGetRoot = false;
	var bStartChunk = false;
	var bNextNewTrunk = false;
	let sTableName = null;
	var sCurTableName = null;
	var sChunkFileName = sOutPutFolder + '/chunk' + iChunkNo + '.xml';
	myInterface.on('line', function (line) {	
		if(xmlFileUtil.ifNeedWrite(line) === false){
			return;
		}

	    iLineNo++;

	    if(!bGetRoot){        
	        if(iLineNo > 10){
	            console.log('DO NOT Find root and can not parse the XML file');
	            return;
	        }
	        bGetRoot = xmlFileUtil.isRootComplete(line.toString());
	        fs.appendFileSync(sOutPutFolder + '/root.xml', line.toString() + "\n");
	        if(bGetRoot === true){        	
	        	fs.appendFileSync(sOutPutFolder + '/root.xml', '</AppsetData>' + "\n");
	            iLineNo = 0;
	            bStartChunk = true;               
	        }
	        
	    }else{
	    	if(bStartChunk === true){
	    		bStartChunk = false;
	    		fs.appendFileSync(sChunkFileName, '<Metadata>' + "\n");
	    	}
	    	if(iLineNo <= operateCons.SPLITROWCOUNT && iContentCount <= operateCons.SPLITCONTENTlENGTH){
	    		if(xmlFileUtil.isNextNewTrunk(line.toString())){
	    			sTableName = xmlFileUtil.parseTableName(line.toString());
	    			sCurTableName = sTableName;
	    			context.addTableMapping(sTableName,iChunkNo);
	    		}
	    		fs.appendFileSync(sChunkFileName, line.toString() + "\n");
	    		iContentCount = iContentCount + line.length;
	    		return;
	    	}    	
	    	
	        bNextNewTrunk = xmlFileUtil.isNextNewTrunk(line.toString());
	        if(bNextNewTrunk === true){        	
	        	if(iLineNo > 0){
	        		fs.appendFileSync(sChunkFileName, '</Metadata>' + "\n");
	        		context.addChunkSize(iChunkNo,iContentCount);      		
	        		iChunkNo++;
	        		sChunkFileName = sOutPutFolder + '/chunk' + iChunkNo + '.xml';
	        		sTableName = xmlFileUtil.parseTableName(line.toString());
	        		sCurTableName = sTableName;
	    			context.addTableMapping(sTableName,iChunkNo);    			
	        	}

	        	iLineNo = 0;
	        	iContentCount = 0;
	        	
	        	fs.appendFileSync(sChunkFileName, '<Metadata>' + "\n");
	        }else{
	        	fs.appendFileSync(sChunkFileName, '</' + sCurTableName + '>' + "\n");
	        	fs.appendFileSync(sChunkFileName, '</Metadata>' + "\n");
	        	context.addChunkSize(iChunkNo,iContentCount);
	        	iChunkNo++;
	        	sChunkFileName = sOutPutFolder + '/chunk' + iChunkNo + '.xml';
	        	context.addTableMapping(sCurTableName,iChunkNo);    
	        	fs.appendFileSync(sChunkFileName, '<Metadata>' + "\n");
	        	fs.appendFileSync(sChunkFileName, '<' + sCurTableName + '>' + "\n");
	        	iLineNo = 1;
	        	iContentCount = 0;
	        }

	        fs.appendFileSync(sChunkFileName, line.toString() + "\n");
	        iContentCount = iContentCount + line.length;      
	    } 
	  // console.log('Line number ' + lineno + ': ' + line);
	});

	myInterface.on('close', function () {
		fs.appendFileSync(sChunkFileName, '</Metadata>' + "\n");
		context.addChunkSize(iChunkNo,iContentCount);
		console.log('table Mapping is ==>' + JSON.stringify(context.getTableMapping()));
		console.log('Chunk size is ==>' + JSON.stringify(context.getChunkSize()));
	});
}

function processMetadata(oContext){

}

function getAppsetInfo(){
	var parser = new xml2js.Parser();
	let oFileContent = fs.readFileSync(context.oAppset.sOutPutFolder + '/root.xml');
	parser.parseString(data, function (err, oResult) {
		if(err){
            console.log("parse xml file error, the error is :" + err);
            return;
        }
	});
	// let oAppsetInfo = context.parseXMLInfo(config, oFileContent); 


}

exports.processMetadata = processMetadata;
exports.preProcessSoureFile = preProcessSoureFile;
