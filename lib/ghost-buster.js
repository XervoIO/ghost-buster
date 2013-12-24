var fs = require('fs'),
    async = require('async'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    path = require('path'),
    FsTools = require('fs-tools'),
    cwd = process.cwd();

//------------------------------------------------------------------------------
var GhostBuster = function() {

};

util.inherits(GhostBuster, EventEmitter);

//------------------------------------------------------------------------------
GhostBuster.prototype.convert = function(callback) {

  var self = this;

  self.paths = {
    serverJs: path.join(cwd, 'core', 'server.js'),
    adminJs: path.join(cwd,'core', 'server','controllers', 'admin.js'),
    indexJs: path.join(cwd, 'index.js'),
    ghostInject: path.join(__dirname, 'ghost-inject.js'),
    cwd: cwd,
    cwdGhostInject: path.join(cwd, 'ghost-inject.js')
  };

  async.series([
    function(callback){
      self.checkIfClean(self.paths, callback);
    },
    function(callback){
      self.correctImagePaths(self.paths, callback);
    },
    function(callback){
      self.copyGhostInject(self.paths, callback);
    },
    function(callback){
      self.injectGhostInject(self.paths, callback);
    },
    function(callback){
      self.copyConfig(self.paths, callback);
    },
    function(callback){
      self.setupConfig(self.paths, callback);
    }
  ], callback);

};



//------------------------------------------------------------------------------

/*
 * Checks to see if ghost-buster has already been ran.   
 */

GhostBuster.prototype.checkIfClean = function(paths, callback) {

  var self = this;

  if(!fs.existsSync(path.join(paths.cwd, 'ghost-inject.js'))){

    callback();

  }else{
  
    return callback(new Error("Looks like ghost-buster was already ran."));
  
  }

};

/*
 * Corrects the image paths in the ghost files.  
 */

GhostBuster.prototype.correctImagePaths = function(paths, callback) {

  var self = this,
      file;

  if(fs.existsSync(paths.serverJs)){

    self.emit('progress', 'Changing server.js');

    file = fs.readFileSync(paths.serverJs, 'utf8' );

    file = file.replace("server.use('/content/images', express['static'](path.join(__dirname, '/../content/images')));", "server.use(process.env.CLOUD_DIR, express['static'](process.env.CLOUD_DIR));" );
    
    file = file.replace("server.use('/ghost/upload/', express.multipart({uploadDir: __dirname + '/content/images'}));","server.use('/ghost/upload/', express.multipart({uploadDir: process.env.CLOUD_DIR}));");

    fs.writeFileSync(paths.serverJs, file);

  }else{

    return callback(new Error("Server.js not found in " + paths.serverJs));
  
  }

  if(fs.existsSync(paths.adminJs)){

    self.emit('progress', 'Changing admin.js');

    file = fs.readFileSync(paths.adminJs, 'utf8' );

    file = file.replace("dir = path.join('content/images', year, month)", "dir = path.join(process.env.CLOUD_DIR, year, month)");

    file = file.replace("return res.send(src);", "return res.send(require('../../../config')[process.env.NODE_ENV].url + src);");
  
    fs.writeFileSync(paths.adminJs, file);

  }else{

    return callback(new Error("admin.js not found in " + paths.adminJs));
  
  }

  callback();
};

/*
 * Copy the ghost-inject.js into the project directory 
 */

GhostBuster.prototype.copyGhostInject = function(paths, callback) {

  var self = this;

  self.emit('progress', 'copying  ghost-inject.js');

  if(!fs.existsSync(path.join(paths.cwd, 'ghost-inject.js'))){

    FsTools.copy(paths.ghostInject, paths.cwdGhostInject, callback);

  }else{
  
    return callback(new Error("ghost-inject.js already exists"));
  
  }

};


/*
 * require('./ghost-inject') at the top of index.js
 */

GhostBuster.prototype.injectGhostInject = function(paths, callback) {

  var self = this;

  self.emit('progress', 'moving  ghost-inject.js');

  if(fs.existsSync(paths.indexJs)){

    self.emit('progress', 'inserting ghost-inject.js');

    file = fs.readFileSync(paths.indexJs, 'utf8' );

    file = "require('./ghost-inject').setup();\n" + file;

    fs.writeFileSync(paths.indexJs, file);

  }else{

    return callback(new Error("index.js not found in " + paths.indexJs));
  
  }

  callback();

};

/*
 * creates the config.js file 
 */

GhostBuster.prototype.copyConfig = function(paths, callback) {

  var self = this;

  if(!fs.existsSync(path.join(paths.cwd, 'config.js'))){

    self.emit('progress', 'No config.js found. Looking for config.example.js');

    if(fs.existsSync(path.join(paths.cwd, 'config.example.js'))){

      self.emit('progress', 'Found config.example.js. Creating config.js from config.example.js');

      FsTools.copy(path.join(paths.cwd, 'config.example.js'), path.join(paths.cwd, 'config.js'), callback);

    }else{

      return callback(new Error("You have no config file and config.example.js was not found to copy"));
    
    }

  }else{

    self.emit('progress', "Looks like you already have a config.js file. Editing the production variables...");

    callback();
    
  }

};

/*
 * Edits the config.js file
 */

GhostBuster.prototype.setupConfig = function(paths, callback) {

  var self = this;

  if(fs.existsSync(path.join(paths.cwd, 'config.js'))){

    self.emit('progress', 'setting up config file.');

    file = fs.readFileSync(path.join(paths.cwd, 'config.js'), 'utf8' );

    file = CustomReplace(file, "host: '127.0.0.1'", "host: '0.0.0.0'", 2);

    file = CustomReplace(file, "port: '2368'", "port: (process.env.PORT || '2368')", 2);

    file = file.replace("http://my-ghost-blog.com", "http://127.0.0.1:2368");

    file = file.replace("filename: path.join(__dirname, '/content/data/ghost.db')"," filename: path.join(process.env.TEMP_DIR, 'ghost.db')");

    fs.writeFileSync(path.join(paths.cwd, 'config.js'), file);

    self.emit('progress', '**Important** : Please set the urls in the config file correctly. Otherwise, image uploads won\'t work. The url for the dev environment has already been set for you.');

  }else{

    return callback(new Error("Something tragic happened. config.js wasn't found. "));
  
  }

  callback();

};


module.exports = new GhostBuster();

//------------------------------------------------------------------------------

// Credits: http://stackoverflow.com/questions/6843441/javascript-how-can-i-replace-only-nth-match-in-the-string

function CustomReplace(strData, strTextToReplace, strReplaceWith, replaceAt) {
    var index = strData.indexOf(strTextToReplace);
    for (var i = 1; i < replaceAt; i++)
        index = strData.indexOf(strTextToReplace, index + 1);
    if (index >= 0)
        return strData.substr(0, index) + strReplaceWith + strData.substr(index + strTextToReplace.length, strData.length);
    return strData;
};