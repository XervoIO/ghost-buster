var fs = require('fs');


exports.setup = function() {

	var dbName
			, timer
			, tempDir = process.env.TEMP_DIR
    	, cloudDir = process.env.CLOUD_DIR;

  /*
	 * Sets the db name based on the environment.   
	 */

	dbName = (process.env.NODE_ENV == "production") ? "ghost.db" : "ghost-dev.db";

	console.log(dbName);

	/*
	 * Initialize database. Checks to see if a db is in the cloud storage. If so,
	 * copy it to temporary storage. 
	 */

	function initDb() {

		if(fs.existsSync(path.join(cloudDir ,dbName))){
			//TODO: catch errors
			fs.createReadStream(path.join(cloudDir ,dbName)).pipe(fs.createWriteStream(path.join(tempDir, dbName));
		
		}
	
	}

	initDb();

	/*
	 * Watch the db in the temp dir for changes. If changed,  
	 */
	fs.watchFile( path.join(tempDir, dbName), function (curr, prev) {
		console.log("db changed");
		clearTimeout(timer);
		timer = window.setTimeout(function () {
			console.log("syncing up");
			fs.createReadStream(path.join(tempDir, dbName)).pipe(fs.createWriteStream(path.join(cloudDir ,dbName)));
		}, 10000);
	});

	
};
