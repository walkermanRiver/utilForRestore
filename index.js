var fs = require('fs'),
    fsExtra = require('fs-extra'),
    xml2js = require('xml2js');
 
var parser = new xml2js.Parser();
var sOutPutFolder = __dirname + "/tempFolder";

fsExtra.removeSync(sOutPutFolder);
fs.mkdirSync(sOutPutFolder);

fs.readFile(__dirname + '/testFile.xml', function(err, data) {
    parser.parseString(data, function (err, oResult) {
        let appsetId = oResult.AppsetData.$.APPSET_ID;
        console.log(appsetId);
        let aMetadata = oResult.Metadata;
        let iTableCount = aMetadata.length;
        for(let i=0; i<iTableCount;i++){
            let oTable = aMetadata[i];
            
        }





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


