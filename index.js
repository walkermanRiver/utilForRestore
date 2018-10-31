var fs = require('fs'),
    fsExtra = require('fs-extra'),
    xml2js = require('xml2js'),
    context = require('./service/context');
 
var parser = new xml2js.Parser();
var sOutPutFolder = __dirname + "/tempFolder";

fsExtra.removeSync(sOutPutFolder);
fs.mkdirSync(sOutPutFolder);

fs.readFile(__dirname + '/testFile.xml', function(err, data) {
    parser.parseString(data, function (err, oResult) {
        if(err){
            console.log("parse xml file error, the error is :" + err);
            return;
        }

        let oOriTables = context.parseXMLInfo(oResult); 
        oTableNames =  context.getTableList();
        for(sTableName in oTableNames){            
            let sTableContent = JSON.stringify(oOriTables[sTableName]); 
            fs.writeFile(sOutPutFolder + '/' + sTableName, sTableContent, function(err) {
                if(err) {
                    return console.log(err);
                }                
            }); 
        }
        console.log("All the DDIC files are saved seperately!");

        // console.dir(result);
        // let sMetadata = JSON.stringify(result);
        // console.log(sMetadata);
        
  //       fs.writeFile(__dirname + '/testJson.json', sMetadata, function(err) {
		//     if(err) {
		//         return console.log(err);
		//     }
		//     console.log("The file was saved!");
		// }); 
		console.log('Done');
    });
});




