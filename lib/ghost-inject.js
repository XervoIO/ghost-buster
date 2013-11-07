var fs = require('fs'),
    config = require('./config')[process.env.NODE_ENV],
    dbFilePath = config.database.connection.filepath,
    siteUrl = config.url,
    tempDir = process.env.TEMP_DIR,
    cloudDir = process.env.CLOUD_DIR,
    express = require('express');


exports.setup = function () {

	var dbName,
		didTheDbChange = false;

	if(process.env.NODE_ENV == "production"){
		dbName = "/ghost.db";
	}else{
		dbName = "/ghost-dev.db";
	}

	/*
	 * Watch the db in the temp dir for changes. 
	 */
	fs.watchFile(tempDir + dbName, function (curr, prev) {
		didTheDbChange = true;
	});

	function initDb(){
		if(fs.existsSync(cloudDir + dbName)){
			fs.createReadStream(cloudDir + dbName).pipe(fs.createWriteStream(tempDir + dbName));
		}
		didTheDbChange = false;
	}

	/*
	 * Initialize database
	 */
	initDb();


	/*
	 * Check every 5 mins for changes to the db. If changed, sync to cloud.
	 */
	setInterval(function () {
		if(didTheDbChange == true){
			fs.createReadStream(tempDir + dbName).pipe(fs.createWriteStream(cloudDir + dbName));
		}
		didTheDbChange = false;
	}, 300000);


};
