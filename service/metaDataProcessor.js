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

function preProcessSoureFilePromise(sSourceFileName, sOutPutFolder){
	return new Promise((resolve, reject) => {
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
		            reject("No root element");
		            // return;
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

		    		//very big row exception handling
		    		if(line.length > operateCons.BIGROWSIZE){
		    			exceptProcessBigRow(sOutPutFolder,sCurTableName,line);
		    			return;
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
		        if(line.length > operateCons.BIGROWSIZE){
	    			exceptProcessBigRow(sOutPutFolder,sCurTableName,line);
	    			return;
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
			resolve("succedd to preprocess xml file");
		});
	});
}

function exceptProcessBigRow(sOutPutFolder,sTableName, sRow){
	let sExceptionFileName = sOutPutFolder + "/exceptBig.xml";
	fs.appendFileSync(sExceptionFileName, '<Metadata>' + "\n");
	fs.appendFileSync(sExceptionFileName, '<' + sTableName + '>' + "\n");
	fs.appendFileSync(sExceptionFileName, sRow + "\n");
	fs.appendFileSync(sExceptionFileName, '</' + sTableName + '>' + "\n");
	fs.appendFileSync(sExceptionFileName, '</Metadata>' + "\n");
}

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

const getAppsetPromise = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(context.oAppset.sOutPutFolder + '/root.xml', (error,data) => {
            if (error){
            	console.log("fail to read root xml file, the error is :" + error);
            	reject(error);
            } 

            var parser = new xml2js.Parser();			
			parser.parseString(data, function (err, oResult) {
				if(err){
		            console.log("fail to parse root xml file, the error is :" + err);
		            reject(err);
		        }
		        console.log("succed to parse root xml file, the result is :" + JSON.stringify(oResult));
		        
		        resolve(oResult.AppsetData.$);
			});            
        });
    });
};

function filterFileServiceEntries = function(){

}

function filterPersistenceEntries = function(){
	
}

function filterTablesPromise(){
	return new Promise((resolve, reject) => {

	})
}

function filterTablesPromise(){
	return new Promise((resolve, reject) => {
		
	})
}

function generateNewMetadataPromise(){
	return new Promise((resolve, reject) => {
		
	})
}

// function getAppsetInfo(){

// 	var parser = new xml2js.Parser();
// 	let oFileContent = fs.readFileSync(context.oAppset.sOutPutFolder + '/root.xml');
// 	parser.parseString(data, function (err, oResult) {
// 		if(err){
//             console.log("parse xml file error, the error is :" + err);
//             return;
//         }
// 	});
// 	// let oAppsetInfo = context.parseXMLInfo(config, oFileContent); 

// }

exports.processMetadata = processMetadata;
exports.preProcessSoureFile = preProcessSoureFile;
exports.preProcessSoureFilePromise = preProcessSoureFilePromise;
exports.getAppsetPromise = getAppsetPromise;