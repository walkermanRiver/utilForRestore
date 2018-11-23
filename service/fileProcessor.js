var fs = require('fs'),
	context = require('./context'),
	xml2js = require('xml2js'),
    xmlFileUtil = require('./xmlFileUtility'),   
    readline = require('readline');

function fileProcessor(oConfiguration, sSourceFolder, sOutputFolder, sOutPutResultFolder, sOutPutRejectFolder){
	this.oConfiguration = oConfiguration;
	this.sSourceFolder = sSourceFolder;
	this.sOutputFolder = sOutputFolder;
	this.sOutPutResultFolder = sOutPutResultFolder;
	this.sOutPutRejectFolder = sOutPutRejectFolder;
}

fileProcessor.prototype.cleanOutputFolder = function(){
	return new Promise((resolve, reject) => {
		fsExtra.removeSync(sOutPutFolder);
		fs.mkdirSync(sOutPutFolder);
	};
};

fileProcessor.prototype.process = function(mProcessor, oContext){
	
};

fileProcessor.prototype.processSecurityFolder = function(mProcessor, oContext){
	
};

fileProcessor.prototype.processNormalFolder = function(mProcessor){
	
};

fileProcessor.prototype.copyFolder = function(sFolder, sTargetParentFolder){
	
};


