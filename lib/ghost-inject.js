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


	/*
	 * Create a simple http server to handle the graceful shutdown requests. The
	 * application has 2 seconds before being shutdown after the request is sent. This way, 
	 * when the app is shutdown, we back up the db one last time.
	 */
	var http = require('http');
	http.createServer(function (req, res) {
	  var data = '';

	  req.on('data', function(chunk) {
	    data += chunk;
	  });
	  req.on('end', function() {
	    var action = JSON.parse(data);
	    switch(action.action) {
	      case 'restart' :
	        break;
	      case 'stop' :
	      	fs.createReadStream(tempDir + dbName).pipe(fs.createWriteStream(cloudDir + dbName));
	        break;
	      case 'deploy' :
	        break;
	    }
	    res.statusCode = 200;
	    res.end();
	  });

	}).listen(63002);

};

function initDb(){
	if(fs.existsSync(cloudDir + dbName)){
		fs.createReadStream(cloudDir + dbName).pipe(fs.createWriteStream(tempDir + dbName));
	}
	didTheDbChange = false;
}