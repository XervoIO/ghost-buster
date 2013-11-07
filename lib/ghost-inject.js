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

	console.log("local db is here : " + tempDir + dbName);
	fs.watchFile(tempDir + dbName, function (curr, prev) {
		console.log('changed');
		didTheDbChange = true;
	});


	function initDb(){
		console.log('initialize db');
		if(fs.existsSync(cloudDir + dbName)){
			console.log('initialize db: db found');
			fs.createReadStream(cloudDir + dbName).pipe(fs.createWriteStream(tempDir + dbName));
			console.log('Copied cloud db to temp');
		}
		didTheDbChange = false;
	}

	initDb();

	setInterval(function () {
		//cpy from temp to cloud
		console.log('checking to sync for cloud');
		if(didTheDbChange == true){
			fs.createReadStream(tempDir + dbName).pipe(fs.createWriteStream(cloudDir + dbName));
			console.log('syncing db to cloud');
		}
		didTheDbChange = false;
	}, 10000);

	var http = require('http');

	/*
	 * Create a simple http server to handle the graceful shutdown requests. The
	 * application has 2 seconds before being shutdown after the request is sent.
	 */
	http.createServer(function (req, res) {
	  var data = '';

	  // Grab request data
	  req.on('data', function(chunk) {
	    data += chunk;
	  });

	  // Once all data is retrieved handle the action
	  req.on('end', function() {
	    var action = JSON.parse(data);
	    switch(action.action) {
	      case 'restart' :
	        // this is where you handle a restart
	        console.log('this was a restart');
	        break;
	      case 'stop' :
	      // this is where you handle a stop
	        console.log('this was a stop');
	        break;
	      case 'deploy' :
	      // this is where you handle a deploy
	        console.log('this was a deploy');
	        break;
	    }
	    res.statusCode = 200;
	    res.end();
	  });

	}).listen(63002);

	console.log('Listening for stop');

	
};