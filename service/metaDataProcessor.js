var fs = require('fs'),
	context = require('./context'),
	xml2js = require('xml2js'),
    xmlFileUtil = require('./xmlFileUtility'),    
    config = require('./configuration'),
    readline = require('readline');

const OPERATECONS = require("./config/constants.json");

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
		    	if(iLineNo <= OPERATECONS.SPLITROWCOUNT && iContentCount <= OPERATECONS.SPLITCONTENTlENGTH){
		    		if(xmlFileUtil.isNextNewTrunk(line.toString())){
		    			sTableName = xmlFileUtil.parseTableName(line.toString());
		    			sCurTableName = sTableName;
		    			context.addTableMapping(sTableName,iChunkNo);
		    		}

		    		//very big row exception handling
		    		if(line.length > OPERATECONS.BIGROWSIZE){
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
		        if(line.length > OPERATECONS.BIGROWSIZE){
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
	    	if(iLineNo <= OPERATECONS.SPLITROWCOUNT && iContentCount <= OPERATECONS.SPLITCONTENTlENGTH){
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

function filterUJDOCEntries(){

}

function filterUJDOCTreeEntries(oContext,oTableContent){
	// let oMapTableChunk = oContext.getTableMapping();
	// let aChunk = oMapTableChunk["UJF_DOCTREE"];
	// let iCount = aChunk.length;
	// for(let iIndex=0; iIndex<iCount; iIndex++){
	// 	sChunkFileName = sOutPutFolder + aChunk[iIndex] + '.xml';
		
	// }
}

function generateCompFilePattern(oValidComponent){
	var componentConfig = require('./config/componentConfig.json');

	for(sComName in oValidComponent){
		if(componentConfig[sComName].hasOwnProperty("fileServicePath")){
			oValidComponent[sComName]["fileServiceRegExp"] = generateRegExpServicePath(componentConfig[sComName]["fileServicePath"]);
		}
	}

	return oValidComponent;
}

function validateSingleFileServiceEntry(oValidComponent, sFilePath, oContext){
	let bEntryFound = false;
	for(sComName in oValidComponent){
		if(oValidComponent[sComName].hasOwnProperty("fileServiceRegExp")){
			let oPattern = oValidComponent[sComName]["fileServiceRegExp"]["oPattern"];
			if(oPattern.test(sFilePath) === true){
				bEntryFound = true;
				let aVariables = oValidComponent[sComName]["fileServiceRegExp"]["aVariables"];
				let iCount = aVariables.length;
				for(let iIndex=0; iIndex<iCount; iIndex++){
					let oVariable = aVariables[iIndex];
					let sValue = RegExp["$" + (iIndex + 1)];
					switch(oVariable[OPERATECONS.OBJID]){
						case OPERATECONS.FILEPATHVARIABLE.APPSETID:
							//validate if appsetId equals sValue;
							break;
						case OPERATECONS.FILEPATHVARIABLE.APPLID:
							//validate if the applid which equals sValue is in the appset
							break;
						case OPERATECONS.FILEPATHVARIABLE.TEAMID:
							//validate if the teamId which equals sValue is in the appset
							break;
						case OPERATECONS.FILEPATHVARIABLE.USERID:
							//validate if the userId which equals sValue is in the appset
							break;
						default:

					}
				}
				break;			
			}			
		}
	}

	//the file path has no valid file path pattern
	if(bEntryFound === false){
		return false;
	}else{
		return true;
	}
}

function generateRegExpServicePath(sPath){
	let sUpCasePath = sPath.toUpperCase();
	let aVariables = [];
	let oBPCObj = {};
	let iPos = null;
	iPos = sUpCasePath.search(OPERATECONS.FILEPATHVARIABLE.APPSETID);
	if(iPos >= 0){
		oBPCObj[OPERATECONS.OBJKEY] = iPos;
		oBPCObj[OPERATECONS.OBJID] = OPERATECONS.FILEPATHVARIABLE.APPSETID;
		aVariables.push(oBPCObj);
	}
	
	

	oBPCObj = {};
	iPos = sUpCasePath.search(OPERATECONS.FILEPATHVARIABLE.APPLID);
	if(iPos >= 0){
		oBPCObj[OPERATECONS.OBJKEY] = iPos;
		oBPCObj[OPERATECONS.OBJID] = OPERATECONS.FILEPATHVARIABLE.APPLID;
		aVariables.push(oBPCObj);
	}

	oBPCObj = {};
	iPos = sUpCasePath.search(OPERATECONS.FILEPATHVARIABLE.TEAMID);
	if(iPos >= 0){
		oBPCObj[OPERATECONS.OBJKEY] = iPos;
		oBPCObj[OPERATECONS.OBJID] = OPERATECONS.FILEPATHVARIABLE.TEAMID;
		aVariables.push(oBPCObj);
	}
	

	oBPCObj = {};
	iPos = sUpCasePath.search(OPERATECONS.FILEPATHVARIABLE.USERID);
	if(iPos >= 0){
		oBPCObj[OPERATECONS.OBJKEY] = iPos;
		oBPCObj[OPERATECONS.OBJID] = OPERATECONS.FILEPATHVARIABLE.USERID;
		aVariables.push(oBPCObj);
	}	

	aVariables.sort(function(oA, oB){
		if(oA.OBJKEY < oB.OBJKEY){
			return -1;
		}else if(oA.OBJKEY > oB.OBJKEY){
			return 1;
		}else{
			return 0
		}
	})

	var sPattern = sUpCasePath.replace(/\\/g,"\\\\")
		.replace(OPERATECONS.FILEPATHVARIABLE.APPSETID, OPERATECONS.REGEXPELEMENT.APPSETID)
		.replace(OPERATECONS.FILEPATHVARIABLE.APPLID, OPERATECONS.REGEXPELEMENT.APPLID)
		.replace(OPERATECONS.FILEPATHVARIABLE.TEAMID, OPERATECONS.REGEXPELEMENT.TEAMID)
		.replace(OPERATECONS.FILEPATHVARIABLE.USERID, OPERATECONS.REGEXPELEMENT.USERID);

	var oPattern = new RegExp(sPattern,"i");

	//later consume can use oPattern.test(str) and check if result is true
	//and then can use RegExp.$1 to get the environment/model value
	return {"aVariables":aVariables,"oPattern":oPattern};
}

function filterPersistenceEntries(){
	
}

function filterMetadataTableEntriesPromise(){

	let sOutputXMLFile = getResultXMLFile();
	let sRejectDataPath = getRejectDataPath();
	//we have got all the valid tables in one object oTableChunkMap
	var oPromiseFilter = Promise.resolve();
	
	oPromiseFilter = oPromiseFilter.then(() => {
		preOutputXMLFile(sOutputXMLFile);
	});

	// oPromiseFilter = oPromiseFilter.then(() => {
	// 	scanToCollectSpeicalTableInfo();
	// });

	while(hasNextTable()){
		let sTableName = getNextTableName();
		
		oPromiseFilter = oPromiseFilter.then((sTableName) => {
			filterSingleTable(sTableName, sOutputXMLFile, sRejectDataPath);
		});
	}

	oPromiseFilter = oPromiseFilter.then(() => {
		postOutputXMLFile(sOutputXMLFile);
	});
	
	return oPromiseFilter;
}

function filterSingleTable(sTableName, sOutputXMLFile, sRejectDataPath){	
	
	let sOutputTableFile = getTableResultFileName(sTableName);
	let sRejectDataFile = getRejectDataTableFileName(sTableName,sRejectDataPath);
	let aChunk = getTableChunk(sTableName);	

	var oPromiseFilter = Promise.resolve();
	oPromiseFilter = oPromiseFilter.then(() => {
		preOutputTableFile(sTableName,sOutputTableFile, sRejectDataFile);
	});

	oPromiseFilter = oPromiseFilter.then(() => {
		aChunk.reduce((promise, iChunk) => promise.then(() => filterSingleTableFile(sTable, iChunk, sOutputTableFile, sRejectDataFile)), Promise.resolve());
	});

	oPromiseFilter = oPromiseFilter.then(() => {
		postOutputTableFile(sTableName,sOutputTableFile, sRejectDataFile);
	});
	
	return oPromiseFilter;
	


		// let iChunkCount = aChunk.length;
		// for(let iChunIndex=0;)

		// while(getNextChunkFileName(sTable, iChunk)){
		// 	oPromiseFilter = oPromiseFilter.then((sTable,iChunk) => filterSingleTableFile(sTable,iChunk));
		// }
	

	// gitFirstTable().then => getChunkFileNames() => for()

	// processBasicMetadata()
	// .then(()=>processNormalMetadata());	
}

function filterSingleTableFile(sTableName,iChunk,sValidOutputTableFile, sRejectOutputTableFile){
	let sSourceTableFileName = getStagingTableFile(sTableName,iChunk);	
	readFile(sSourceTableFileName)
	.then((err, sFileContent) => {
		//check error;
		parseXMLData(sFileContent);
	})
	.then((oJsonData) => {
		let aTableData = oJsonData[sTable];		
		let oResultData = filterSingleTableEntries(sTableName,aTableData);
		let aValidData = oResultData["validData"];
		let aRejectData = oResultData["rejectData"];
		appendValidDataFile(sValidOutputTableFile, aFilteredResult)
		.then(() => appendRejectDataFile(sRejectOutputTableFile, aRejectData));
	});	
}

function filterSingleTableEntries(sTableName, aTableData){
	if(isSpecialTable(sTableName) === true){
		return filterSpecialTableEntries(sTableName, aTableData);
	}else{
		return filterNormalTableEntries(sTableName, aTableData);		
	}
}

function filterNormalTableEntries(sTableName, aTableData){
	let oTableKeyInfo;
	let aTableForeignKeys = oTableKeyInfo.foreignKeys;
	return validateRowForeigns(aTableData, aTableForeignKeys);

	// let oResultData = {};

	// if(!aTableForeignKeys || aTableForeignKeys.length <= 0){
	// 	//no need to filter data, keep all the data
	// 	oResultData["validData"] = aTableData;
	// 	return oResultData;
	// }

	// let aValidData = [];
	// let aRejectData = [];
	// let iKeyCount = aTableForeignKeys.length;
	// let oReferenceTableColumn = {};
	// let oReferenceTableColumnValue,sTableColumnKey;
	// aTableForeignKeys.forEach(function(oForeignKey){
	// 	//use object to act as hash
	// 	oReferenceTableColumnValue = getValidColumnValue(oForeignKey.referenceTable, oForeignKey.referenceColumn);
	// 	sTableColumnKey = generateTableColumnKey(oForeignKey.referenceTable,oForeignKey.referenceColumn);
	// 	oReferenceTableColumn[sTableColumnKey] = oReferenceTableColumnValue;		
	// });

	// let bRowValid = true;
	// let oRow = null;
	// for(let iRowIndex=0, iCount = aTableData.length; iRowIndex<iCount; iRowIndex++){
	// 	bRowValid = true;
	// 	oRow = aTableData[iRowIndex];
	// 	for(let iKeyIndex=0; iKeyIndex<iKeyCount; iKeyIndex++){
	// 		oTableKey = aTableForeignKeys[iKeyIndex];
	// 		let sColValue = oRow[oTableKey.column];
	// 		let sReferenceTableColumnKey = generateTableColumnKey(oTableKey.referenceTable, oTableKey.referenceColumn);
	// 		bRowValid = oReferenceTableColumn[sReferenceTableColumnKey][sColValue];
	// 		if(!bRowValid){
	// 			break;
	// 		}
	// 	}
	// 	if(bRowValid){
	// 		aValidData.push(oRow);
	// 	}else{
	// 		aRejectData.push(oRow);
	// 	}
	// }

	// oResultData["validData"] = aValidData;
	// oResultData["rejectData"] = aRejectData;

	// return oResultData;
}

function validateTableDataForeigns(aTableData,  aTableForeignKeys){

	let oResultData = {};

	if(!aTableForeignKeys || aTableForeignKeys.length <= 0){
		//no need to filter data, keep all the data
		oResultData["validData"] = aTableData;
		return oResultData;
	}

	let aValidData = [];
	let aRejectData = [];	
	let oReferenceTableColumn = {};
	let oReferenceTableColumnValue,sTableColumnKey;
	aTableForeignKeys.forEach(function(oForeignKey){
		//use object to act as hash
		oReferenceTableColumnValue = getValidColumnValue(oForeignKey.referenceTable, oForeignKey.referenceColumn);
		sTableColumnKey = generateTableColumnKey(oForeignKey.referenceTable,oForeignKey.referenceColumn);
		oReferenceTableColumn[sTableColumnKey] = oReferenceTableColumnValue;		
	});

	

	let iKeyCount = aTableForeignKeys.length;
	let bRowValid = true;
	let oRow = null;
	for(let iRowIndex=0, iCount = aTableData.length; iRowIndex<iCount; iRowIndex++){
		bRowValid = true;
		oRow = aTableData[iRowIndex];

		bRowValid = validateTableRow(oRow, aTableForeignKeys, oReferenceTableColumn);
		
		if(bRowValid){
			aValidData.push(oRow);
		}else{
			aRejectData.push(oRow);
		}
	}

	oResultData["validData"] = aValidData;
	oResultData["rejectData"] = aRejectData;

	return oResultData;

}

function validateTableRow(oRow,  aTableForeignKeys, oReferenceTableColumn){
	let iKeyCount = aTableForeignKeys.length;
	let oTableKey = null;
	let bRowValid = true;
		
	for(let iKeyIndex=0; iKeyIndex<iKeyCount; iKeyIndex++){
		oTableKey = aTableForeignKeys[iKeyIndex];
		let sColValue = oRow[oTableKey.column];
		let sReferenceTableColumnKey = generateTableColumnKey(oTableKey.referenceTable, oTableKey.referenceColumn);
		bRowValid = oReferenceTableColumn[sReferenceTableColumnKey][sColValue];
		if(!bRowValid){
			return false;
		}
	}
	
	return true;	
}

function filterSpecialTableEntries(sTableName, aTableData){
	//we should have special handling for file service, persistence table
	switch(sTableName){
		case "UJF_DOC":
			break;
		case "UJF_DOCTREE";
			break;
		case "UJPS_RESOURCE";
			break;
		default:		
	}

}

function validatePersistenceResourceHierarchy(sTableName, aTableBatchData){
	oDocTreeDep = getHierarchyDependency(sTableName);
	const sColNameCurrent = "RESOURCE_ID";
	const sColNameParent = "PARENT_RES_ID";
	const sColNameCreateTime = "CREATE_TIME";	

	//first sort the table entries, this is only used to enhance performance
	aTableBatchData.sort(function(oRowA, oRowB){		
		if (oRowA[sColNameCreateTime] < oRowB[sColNameCreateTime] ) {
		    return -1;
		}
		if (oRowA[sColNameCreateTime] > oRowB[sColNameCreateTime] ) {
		    return 1;
		}		
		return 0;		
	});

	validateTableRowsHierarchy(aTableBatchData, oDocTreeDep, sColNameCurrent, sColNameParent);
}

function filterPersistenceResourceRows(sTableName, aTableBatchData){	
	const sColNameOwnType = "OWNER_TYPE";
	const sColNameOwnerId = "OWNER_ID";
	
	let oRow = null;
	let aTableForeignKeys = [];
	let bRowValid = false;

	let oResultData = {};
	let aValidData = [];
	let aRejectData = [];

	for(let iRowIndex=0, iRowCount=aTableData.length; iRowIndex<iRowCount; iRowIndex++){
		oRow = aTableData[iRowIndex];
		
		bRowValid = false;
		sDocName = oRow[sFilePathColumn];
		aTableForeignKeys = [];

		for(let iPatternIndex=0; iPatternIndex<iPatternCount; iPatternIndex++){
			oPattern = aValidFileRegExps[iPatternIndex]["oPattern"];
			if(oPattern.test(sDocName) === true){				
				aVariables = aValidFileRegExps[iPatternIndex]["aVariables"];
				iVariableCount = aVariables.length;
				for(let iVariableIndex=0; iVariableIndex<iVariableCount; iVariableIndex++){
					oVariable = aVariables[iVariableIndex];
					sVariableValue = RegExp["$" + (iIndex + 1)];
					let oTableForeignKey = getForeignKeyWithType(oVariable[OPERATECONS.OBJID]);
					aTableForeignKeys.push(oTableForeignKey);					
				}

				break;				
			}
		}

		if(aTableForeignKeys.length > 0){
			bRowValid = validateTableRow(oRow,aTableForeignKeys,oReferenceTableColumn);
			if(bRowValid){
				aValidData.push(oRow);
			}else{
				aRejectData.push(oRow);
			}
		}else{
			aValidData.push(oRow);
		}
	}

	oResultData["validData"] = aValidData;
	oResultData["rejectData"] = aRejectData;

	return oResultData;
}

function filterFileServiceDocEntries(sTableName, aTableData){
	return filterFileServiceEntries(sTableName, "DOC", aTableData);
}

function filterFileServiceDocTreeEntries(sTableName, aTableData){
	//TBD it is difficult to check doc hierarchy for big data
	var oFlteredData = filterFileServiceEntries(sTableName, "DOCNAME", aTableData);
	var oFlterDataHierarchy = flterFileServiceHierarchy(sTableName, oFlteredData["validData"]);

	var oReulst = {};
	oReulst["validData"] = oFlterDataHierarchy["validData"];
	oReulst["rejectData"] = oFlteredData["rejectData"].concat(oFlterDataHierarchy["rejectData"]);
	return oReulst;
}

function holdFileServiceDocTreeRow(oDocTreeDep, sDocName, oRow){
	var aRows = getHeldTableBatchRows(sDocName);
	aRows.push(oRow);
	if(aRows.length > OPERATECONS.SPLITROWCOUNT){
		//sync write aRows into file
		var sHeldTableBatchFileName = getHeldTableBatchFileName(sDocName);
		//TBD
	}
}

// function validateDocTreeDependency(oDocTreeDep, aDependency, sStatus){
// 	if(sStatus === OPERATECONS.VALIDATESTATUS.UNKNOWN){
// 		return {};
// 	}

// 	while(aDependency.length > 0){
// 		var sDependencyName = aDependency.shift();
// 		if(oDocTreeDep.hasOwnProperty(sDependencyName)){
// 			var oDependency = oDocTreeDep[sDependencyName];
// 			oDependency.status = sStatus;
// 			if(oDependency.aDependency.length > 0){
// 				for(let iDependIndex=0, let iDepCount = oDependency.aDependency.length; iDependIndex<iDepCount; iDependIndex++){
// 					aDependency.push(oDependency.aDependency.shift());					
// 				}
// 			}
// 		}
// 	}
// }

function validateFileServiceHierarchy(sTableName, aTableBatchData){
	//oDocTreeDep={"docName:{status:1, aDependency["docName1", "docName2"]}"}
	oDocTreeDep = getHierarchyDependency(sTableName);
	const sColNameCurrent = "DOCNAME";
	const sColNameParent = "PARENTDOC";	

	//first sort the table entries based on docname. this is special to file service, but can not be used to persistence	
	aTableBatchData.sort(function(oRowA, oRowB){
		if (oRowA[sColName] < oRowB[sColName] ) {
		    return -1;
		}
		if (oRowA[sColName] > oRowB[sColName] ) {
		    return 1;
		}		
		return 0;		
	});

	validateTableRowsHierarchy(aTableBatchData, oDocTreeDep, sColNameCurrent, sColNameParent);	
}

function filterFileServiceEntries(sTableName, sFilePathColumn, aTableData){
	var aValidFileRegExps = getValidFileServiceRegExp();
	let iPatternCount = aValidFileRegExps.length;
	let oPattern = null;
	let aVariables = null;
	let oVariable = null;
	let iVariableCount = null;
	let sVariableValue = null;
	let bEntryFound = false;
	let sDocName = null;
	let oRow = null;
	let aTableForeignKeys = [];
	let bRowValid = false;

	let oResultData = {};
	let aValidData = [];
	let aRejectData = [];

	for(let iRowIndex=0, iRowCount=aTableData.length; iRowIndex<iRowCount; iRowIndex++){
		oRow = aTableData[iRowIndex];
		
		bRowValid = false;
		sDocName = oRow[sFilePathColumn];
		aTableForeignKeys = [];

		for(let iPatternIndex=0; iPatternIndex<iPatternCount; iPatternIndex++){
			oPattern = aValidFileRegExps[iPatternIndex]["oPattern"];
			if(oPattern.test(sDocName) === true){				
				aVariables = aValidFileRegExps[iPatternIndex]["aVariables"];
				iVariableCount = aVariables.length;
				for(let iVariableIndex=0; iVariableIndex<iVariableCount; iVariableIndex++){
					oVariable = aVariables[iVariableIndex];
					sVariableValue = RegExp["$" + (iIndex + 1)];
					let oTableForeignKey = getForeignKeyWithType(oVariable[OPERATECONS.OBJID]);
					aTableForeignKeys.push(oTableForeignKey);					
				}

				break;				
			}
		}

		if(aTableForeignKeys.length > 0){
			bRowValid = validateTableRow(oRow,aTableForeignKeys,oReferenceTableColumn);
			if(bRowValid){
				aValidData.push(oRow);
			}else{
				aRejectData.push(oRow);
			}
		}else{
			aValidData.push(oRow);
		}
	}

	oResultData["validData"] = aValidData;
	oResultData["rejectData"] = aRejectData;

	return oResultData;
}



// function processBasicMetadata(){
// 	return new Promise((resolve, reject) => {
// 		let oAppsetInfo = context.oAppset;		
// 		let oMapTableChunk = oContext.getTableMapping();
// 		//will handle UJA_DIMENSION,UJA_APPL,UJE_TEAM_AGR,UJE_TEAM_MULTAGR?,
// 		let aChunk = oMapTableChunk["UJA_DIMENSION"];
// 		let iCount = aChunk.length;
// 		for(let iIndex=0; iIndex<iCount; iIndex++){
// 			sChunkFileName = sOutPutFolder + aChunk[iIndex] + '.xml';
			
// 		}

// 	})
// }

// function processNormalMetadata(){
// 	return new Promise((resolve, reject) => {

// 	})
// }



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