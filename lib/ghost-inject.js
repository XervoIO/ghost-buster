var fs = require('fs'),
    config = require('./config')[process.env.NODE_ENV],
    dbFilePath = config.database.connection.filepath,
    siteUrl = config.url,
    tempDir = process.env.TEMP_DIR,
    cloudDir = process.env.CLOUD_DIR,
    express = require('express');


exports.setup = function () {

	var dbName,
		timer;

	if(process.env.NODE_ENV == "production"){
		dbName = "ghost.db";
	}else{
		dbName = "ghost-dev.db";
	}


	function initDb(){
		if(fs.existsSync(path.join(cloudDir ,dbName))){
			fs.createReadStream(path.join(cloudDir ,dbName)).pipe(fs.createWriteStream(path.join(tempDir, dbName));
		}
	}

	/*
	 * Initialize database
	 */
	initDb();

	/*
	 * Watch the db in the temp dir for changes. 
	 */
	fs.watchFile( path.join(tempDir, dbName), function (curr, prev) {
		clearTimeout(timer);
		timer = window.setTimeout(function () {
			fs.createReadStream(path.join(tempDir, dbName)).pipe(fs.createWriteStream(path.join(cloudDir ,dbName)));
		}, 10000);
	});

	
};
