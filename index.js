var context = require('./service/context'),
	mProcessor = require('./service/metaDataProcessor'),
    fProcessor = require('./service/fileProcessor'),
    configuration = require('./configuration');

function process(){
	let sSourceFolder = getSourceFolder();
	let sSourceMetadataFile = getSourceMetadataXMLFile();
	let sOutputFolder = getOutputFolder();
	let sOutPutRejectFolder = getOutputRejectFolder();
	let sOutPutResultFolder = getOutputResultFolder();
	let sGroupConfig = getDynamicGroupConfig();
	let oConfiguration = new configuration(sGroupConfig);
	let oContext = new context();

	oConfiguration.init()
	.then(()=>{
		let oFProcessor = new fProcessor(oConfiguration, sSourceFolder, sOutputFolder, sOutPutResultFolder, sOutPutRejectFolder);
		oFProcessor.cleanOutputFolder();
	})	
	.then(()=>{
		let oMProcessor = new mProcessor(oConfiguration, sSourceMetadataFile, sOutputFolder, sOutPutResultFolder, sOutPutRejectFolder);
		return oMProcessor.processMetadata(oFProcessor, oContext);	
	})
	.then((oMProcessor)=>{
		return oFProcessor.processFile(oMProcessor, oContext);
	})
	.then(()=>{
		console.log("Success to process data");
	})
	.catch((error)=>{
		console.log("Fail to process data");
		console.log(error);
	});
}

//this function is used to support UI to let user select entity to filter data
//do not support package first
function getComponentEntityList(sSourceFolder, sComponentName){

}

function getSourceFolder(){
	return __dirname + '/exampleData';	
}

function getSourceMetadataXMLFile(){
	return getSourceXMLFile() + '/Metadata.xml';	
}

function getOutputFolder(){
	return __dirname + "/output";	
}

function getOutputRejectFolder(){
	return getOutputFolder() + "/rejectOutput";	
}

function getOutputResultFolder(){
	return getOutputFolder() + "/result";	
}

function getDynamicGroupConfig(){
	return __dirname + '/config/defaultGroupConfig.json';	
}


// cleanTempFiles(sOutPutXMLFolder);


// metaDataProcessor.preProcessSoureFilePromise(sSourceXMLFile,sOutPutXMLFolder)
// 	// .then(()=> metaDataProcessor.getAppsetPromise())
// 	// .then(()=> metaDataProcessor.filterMetadataTableEntriesPromise())
// 	// .then(()=> metaDataProcessor.generateNewMetadataPromise())
// 	.then(oResult=> console.log(oResult))
// 	.catch(error => console.log(error));






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
// var sSourceFileName = __dirname + '/exampleData/Metadata.xml';
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


// var str = '\\ROOT\\WEBFOLDERS\\environment\\planning\\EEXCEL\\BOOKS\\load';
// var pattern = /\\ROOT\\WEBFOLDERS\\([a-z]+)\\([a-z]+)\\EEXCEL\\BOOKS\\([a-z]+)/;
// var pattern = /\\ROOT\\WEBFOLDERS\\([^\s]+)\\([^\s]+)\\EEXCEL\\BOOKS\\/;

// pattern.test(str);
// RegExp.$1
