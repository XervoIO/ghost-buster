var fs = require('fs'),
    async = require('async'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    path = require('path'),
    FsTools = require('fs-tools'),
    cwd = process.cwd();

//--------------------------------------------------------------------------------------------------
var GhostBuster = function() {

};

util.inherits(GhostBuster, EventEmitter);

//--------------------------------------------------------------------------------------------------
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
      self.correctImagePaths(self.paths, callback);
    },
    function(callback){
      self.copyGhostInject(self.paths, callback);
    },
    function(callback){
      self.moveGhostInject(self.paths, callback);
    },
    function(callback){
      self.copyConfig(self.paths, callback);
    },
    function(callback){
      self.setupConfig(self.paths, callback);
    }
  ], callback);

};



//--------------------------------------------------------------------------------------------------
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

    return callback("Server.js not found in " + paths.serverJs);
  
  }

  if(fs.existsSync(paths.adminJs)){

    self.emit('progress', 'Changing admin.js');

    file = fs.readFileSync(paths.adminJs, 'utf8' );

    file = file.replace("dir = path.join('content/images', year, month)", "dir = path.join(process.env.CLOUD_DIR, year, month)");

    file = file.replace("return res.send(src);", "return res.send(require('../../../config')[process.env.NODE_ENV].url + src);");
  
    fs.writeFileSync(paths.adminJs, file);

  }else{

    return callback("admin.js not found in " + paths.adminJs);
  
  }

  callback();
};


GhostBuster.prototype.copyGhostInject = function(paths, callback) {

  var self = this;

  self.emit('progress', 'copying  ghost-inject.js');

  if(!fs.existsSync(path.join(paths.cwd, 'ghost-inject.js'))){

    FsTools.copy(paths.ghostInject, paths.cwdGhostInject, callback);

  }else{
  
    return callback("ghost-inject already exists");
  
  }

};


GhostBuster.prototype.moveGhostInject = function(paths, callback) {

  var self = this;

  self.emit('progress', 'moving  ghost-inject.js');

  if(fs.existsSync(paths.indexJs)){

    self.emit('progress', 'inserting ghost-inject.js');

    file = fs.readFileSync(paths.indexJs, 'utf8' );

    file = "require('./ghost-inject').setup();\n" + file;

    fs.writeFileSync(paths.indexJs, file);

  }else{

    return callback("index.js not found in " + paths.indexJs);
  
  }

  callback();

};

GhostBuster.prototype.copyConfig = function(paths, callback) {

  var self = this;

  if(!fs.existsSync(path.join(paths.cwd, 'config.js'))){

    self.emit('progress', 'No config.js found. Looking for config.example.js');

    if(fs.existsSync(path.join(paths.cwd, 'config.example.js'))){

      self.emit('progress', 'Found config.example.js. Creating config.js from config.example.js');

      FsTools.copy(path.join(paths.cwd, 'config.example.js'), path.join(paths.cwd, 'config.js'), callback);

    }else{

      return callback("You have no config file and config.example.js was not found to copy");
    
    }

  }else{

    self.emit('progress', "Looks like you already have a config.js file. Please refer to the docs to set it correctly");
  
  }

};

GhostBuster.prototype.setupConfig = function(paths, callback) {

  var self = this;

  if(fs.existsSync(path.join(paths.cwd, 'config.js'))){

    self.emit('progress', 'setting up config file.');

    file = fs.readFileSync(path.join(paths.cwd, 'config.js'), 'utf8' );

    file = file.replace(/host: '127.0.0.1'/g," host: '0.0.0.0'");

    file = file.replace(/port: '2368'/g," port: (process.env.PORT || '2368')");

    file = file.replace("filename: path.join(__dirname, '/content/data/ghost.db')"," filename: path.join(process.env.TEMP_DIR, '/ghost.db')");

    file = file.replace("filename: path.join(__dirname, '/content/data/ghost-dev.db')"," filename: path.join(process.env.TEMP_DIR, '/ghost-dev.db')");


    fs.writeFileSync(path.join(paths.cwd, 'config.js'), file);

  }else{

    return callback("Something tragic happened. config.js wasn't found. ");
  
  }

  callback();

};

module.exports = new GhostBuster();