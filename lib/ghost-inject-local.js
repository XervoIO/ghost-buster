var fs = require('fs'),
  path = require('path'),
  dbName;

/*
 * Sets the db name based on the environment.   
 */

dbName = (process.env.NODE_ENV == "production") ? "ghost.db" : "ghost-dev.db";


process.env.TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, '/content/data');

process.env.CLOUD_DIR = process.env.CLOUD_DIR || path.join(process.cwd(), '/content');


exports.setup = function() {

  // Nothing needs to be done because the database is being copied from local
  
};
