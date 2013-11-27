var fs = require('fs'),
	path = require('path'),
	dbName;

/*
 * Sets the db name based on the environment.   
 */

dbName = (process.env.NODE_ENV == "production") ? "ghost.db" : "ghost-dev.db";


process.env.TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, '/content/data');

process.env.CLOUD_DIR = process.env.CLOUD_DIR || path.join(process.cwd(), '/content/images');

console.log(process.env.CLOUD_DIR);


exports.setup = function() {

	var timer
			, tempDir = process.env.TEMP_DIR
    	, cloudDir = process.env.CLOUD_DIR;

	console.log(dbName);

	/*
	 * Initialize database. Checks to see if a db is in the cloud storage. If so,
	 * copy it to temporary storage. 
	 */

	function initDb() {

		if(fs.existsSync(path.join(cloudDir ,dbName))){
			//TODO: catch errors
			fs.createReadStream(path.join(cloudDir ,dbName))
				.pipe(fs.createWriteStream(path.join(tempDir, dbName)));
		
		}
	
	}

	initDb();

	/*
	 * Watch the db in the temp dir for changes. If changed,  
	 */
	fs.watchFile( path.join(tempDir, dbName), function (curr, prev) {
		console.log("db changed");
		clearTimeout(timer);
		timer = setTimeout(function () {
			console.log("syncing up");
			fs.createReadStream(path.join(tempDir, dbName)).pipe(fs.createWriteStream(path.join(cloudDir ,dbName)));
		}, 10000);
	});

	
};
