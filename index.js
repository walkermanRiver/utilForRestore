var fs = require('fs'),
    fsExtra = require('fs-extra'),
    // xml2js = require('xml2js'),    
    context = require('./service/context'),
    xmlFileUtil = require('./service/xmlFileUtility'),
    // bigXml = require('big-xml'),
    operateCons = require("./service/config/constants.json"),
    config = require('./service/configuration');

// var parser = new xml2js.Parser();
var sOutPutFolder = __dirname + "/tempFolder";

fsExtra.removeSync(sOutPutFolder);
fs.mkdirSync(sOutPutFolder);

var sSourceFileName = __dirname + '/exampleData/Metadata.xml';
// var sSourceFileName = __dirname + '/testFile.xml';


// var readStream = fs.createReadStream(sSourceFileName);
// readStream.pipe(process.stdout);

const readline = require('readline');

var myInterface = readline.createInterface({
  input: fs.createReadStream(sSourceFileName)
});

var iLineNo = 0;
var iContentCount = 0;
var iChunkNo = 1;
var bGetRoot = false;
var bStartChunk = false;
var bNextNewTrunk = false;
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
    			let sTableName = xmlFileUtil.parseTableName(line.toString());
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
        		iChunkNo++;
        		sChunkFileName = sOutPutFolder + '/chunk' + iChunkNo + '.xml';
        		let sTableName = xmlFileUtil.parseTableName(line.toString());
    			context.addTableMapping(sTableName,iChunkNo);
        	}

        	iLineNo = 0;
        	iContentCount = 0;
        	
        	fs.appendFileSync(sChunkFileName, '<Metadata>' + "\n");
        }

        fs.appendFileSync(sChunkFileName, line.toString() + "\n");
        iContentCount = iContentCount + line.length;      
    } 
  // console.log('Line number ' + lineno + ': ' + line);
});

myInterface.on('close', function () {
	fs.appendFileSync(sChunkFileName, '</Metadata>' + "\n");
});


// var readStream = fs.createReadStream(sSourceFileName);
// readStream.setEncoding('UTF8');
// readStream
//   .on('data', function (chunk) {
//   	console.log("new chunk");
//     console.log(chunk);
//   })
//   .on('end', function () {
//     console.log("done");
//   });

// fs.readFile(__dirname + '/exampleData/Metadata.xml', function(err, data) {
// // fs.readFile(__dirname + '/testFile.xml', function(err, data) {
//     parser.parseString(data, function (err, oResult) {
//         if(err){
//             console.log("parse xml file error, the error is :" + err);
//             return;
//         }

//         let oOriTables = context.parseXMLInfo(config, oResult); 

//         //clear memory
//         oResult = null;

//         oTableNames =  context.getTableList();
//         for(sTableName in oTableNames){
//             let aNewRows = context.formatJson(oOriTables[sTableName]);
//             if(!aNewRows || aNewRows.length === 0){
//                 console.log("Skip table " + sTableName + " when format data!");
//                 continue;
//             }
//             let sTableContent = JSON.stringify(aNewRows); 
//             fs.writeFileSync (sOutPutFolder + '/' + sTableName + ".json", sTableContent); 

//             //clear memory 
//             delete oOriTables[sTableName];
//         }
//         console.log("All the DDIC files are saved seperately!");

// 		console.log('Done');
//     });
// });




