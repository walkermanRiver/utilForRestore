var fs = require('fs'),
    fsExtra = require('fs-extra'),
    // xml2js = require('xml2js'),
    metaDataProcessor = require('./service/metaDataProcessor');
    // context = require('./service/context'),
    // xmlFileUtil = require('./service/xmlFileUtility'),    
    // config = require('./service/configuration'),
    // readline = require('readline');

// const operateCons = require("./service/config/constants.json");
// var parser = new xml2js.Parser();
// var sOutPutXMLFolder = __dirname + "/tempFolder";
// var sSourceXMLFile = __dirname + '/exampleData/Metadata.xml';

function getSourceXMLFile(){
	const sSourceXMLFile = __dirname + '/exampleData/Metadata.xml';
	return sSourceXMLFile;
}

function getTempFolder(){
	const sOutPutXMLFolder = __dirname + "/tempFolder";
	return sOutPutXMLFolder;
}

function cleanTempFiles(sOutPutFolder){
	fsExtra.removeSync(sOutPutFolder);
	fs.mkdirSync(sOutPutFolder);
}

let sOutPutXMLFolder = getTempFolder();
let sSourceXMLFile = getSourceXMLFile();
cleanTempFiles(sOutPutXMLFolder);
// metaDataProcessor.preProcessSoureFile(sSourceXMLFile,sOutPutXMLFolder);

metaDataProcessor.preProcessSoureFilePromise(sSourceXMLFile,sOutPutXMLFolder)
	// .then(()=> metaDataProcessor.getAppsetPromise())
	// .then(()=> metaDataProcessor.filterTablesPromise())
	// .then(()=> metaDataProcessor.generateNewMetadataPromise())
	.then(oResult=> console.log(oResult))
	.catch(error => console.log(error));














// var sSourceFileName = __dirname + '/testFile.xml';


// var readStream = fs.createReadStream(sSourceFileName);
// readStream.pipe(process.stdout);






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





// var fs = require('fs');
// var xml2js = require('xml2js');
// var sSourceFileName = __dirname + '/tempFolder/chunk5.xml';
// var parser = new xml2js.Parser();
// fs.readFile(sSourceFileName, function(err, data) {
// // fs.readFile(__dirname + '/testFile.xml', function(err, data) {
//     parser.parseString(data, function (err, oResult) {
//         if(err){
//             console.log("parse xml file error, the error is :" + err);
//             return;
//         }

//         // let oOriTables = context.parseXMLInfo(config, oResult); 

//         // //clear memory
//         // oResult = null;

//         // oTableNames =  context.getTableList();
//         // for(sTableName in oTableNames){
//         //     let aNewRows = context.formatJson(oOriTables[sTableName]);
//         //     if(!aNewRows || aNewRows.length === 0){
//         //         console.log("Skip table " + sTableName + " when format data!");
//         //         continue;
//         //     }
//         //     let sTableContent = JSON.stringify(aNewRows); 
//         //     fs.writeFileSync (sOutPutFolder + '/' + sTableName + ".json", sTableContent); 

//         //     //clear memory 
//         //     delete oOriTables[sTableName];
//         // }
//         // console.log("All the DDIC files are saved seperately!");

// 		console.log('Done');
//     });
// });




