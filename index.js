var fs = require('fs'),
    fsExtra = require('fs-extra'),
    // xml2js = require('xml2js'),    
    context = require('./service/context'),
    // bigXml = require('big-xml'),
    config = require('./service/configuration');

// var parser = new xml2js.Parser();
var sOutPutFolder = __dirname + "/tempFolder";

fsExtra.removeSync(sOutPutFolder);
fs.mkdirSync(sOutPutFolder);

// var sSourceFileName = __dirname + '/exampleData/Metadata.xml';
var sSourceFileName = __dirname + '/testFile.xml';


// var readStream = fs.createReadStream(sSourceFileName);
// readStream.pipe(process.stdout);

const readline = require('readline');

var myInterface = readline.createInterface({
  input: fs.createReadStream(sSourceFileName)
});

var lineno = 0;
myInterface.on('line', function (line) {
  lineno++;
  console.log('Line number ' + lineno + ': ' + line);
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




