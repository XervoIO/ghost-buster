var fs = require('fs-extra'),
  async = require('async'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  path = require('path'),
  FsTools = require('fs-tools'),
  cwd = process.cwd(),
  customReplace = require('../utils/customReplace'),
  glob = require('glob');

//------------------------------------------------------------------------------
var GhostBuster = function() {

};

util.inherits(GhostBuster, EventEmitter);

//------------------------------------------------------------------------------
GhostBuster.prototype.convert = function(databaseLocation, callback) {

  var self = this;

  self.paths = {
    serverJs: path.join(cwd, 'core', 'server.js'),
    adminJs: path.join(cwd, 'core', 'server', 'controllers', 'admin.js'),
    indexJs: path.join(cwd, 'index.js'),
    ghostInject: path.join(__dirname, 'ghost-inject.js'),
    modulusFileSystem: path.join(__dirname, 'modulusfilesystem.js'),
    cwdModulusFileSystem: path.join(cwd, 'core', 'server', 'storage', 'modulusfilesystem.js'),
    storageIndex: path.join(cwd, 'core', 'server', 'storage', 'index.js'),
    cwd: cwd,
    cwdGhostInject: path.join(cwd, 'ghost-inject.js'),
  };



  async.series([

    function(callback) {
      self.checkPackageDotJson(self.paths, callback);
    },
    function(callback) {
      self.checkIfClean(self.paths, callback);
    },
    function(callback) {
      self.copyGhostInject(databaseLocation, self.paths, callback);
    },
    function(callback) {
      self.injectGhostInject(databaseLocation, self.paths, callback);
    },
    function(callback) {
      self.copyConfig(self.paths, callback);
    },
    function(callback) {
      self.setupConfig(databaseLocation, self.paths, callback);
    }
  ], callback);



};

//------------------------------------------------------------------------------
GhostBuster.prototype.upgrade = function(version, callback) {

  var self = this;

  self.paths = {
    serverJs: path.join(cwd, 'core', 'server.js'),
    adminJs: path.join(cwd, 'core', 'server', 'controllers', 'admin.js'),
    indexJs: path.join(cwd, 'index.js'),
    ghostInject: path.join(__dirname, 'ghost-inject.js'),
    modulusFileSystem: path.join(__dirname, 'modulusfilesystem.js'),
    cwdModulusFileSystem: path.join(cwd, 'core', 'server', 'storage', 'modulusfilesystem.js'),
    storageIndex: path.join(cwd, 'core', 'server', 'storage', 'index.js'),
    cwd: cwd,
    cwdGhostInject: path.join(cwd, 'ghost-inject.js'),
  };

  async.series([

    function(callback) {
      self.checkPackageDotJson(self.paths, callback);
    },
    function(callback) {
      self.upgradeGhost(self.paths, version, callback);
    }
  ], callback);

};



//------------------------------------------------------------------------------

/*
 * Checks to see if ghost-buster has already been ran.
 */

GhostBuster.prototype.checkIfClean = function(paths, callback) {

  var self = this;

  self.emit('progress', 'Checking to make sure this ghost has not been busted.');

  if (!fs.existsSync(path.join(paths.cwd, 'ghost-inject.js'))) {

    callback();

  } else {

    return callback(new Error('Looks like ghost-buster was already ran.'));

  }

};

/*
 * Checks to see if ghost-buster has already been ran.
 */

GhostBuster.prototype.checkPackageDotJson = function(paths, callback) {

  var self = this;

  var packageDotJson = require(path.join(cwd, 'package.json'));

  if (packageDotJson.main !== './index') {

    self.emit('progress', 'Updating Package.json');

    packageDotJson.main = 'index.js';

    fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(packageDotJson, null, 4));

    callback();

  }

};



/*
 * Corrects the image paths in the ghost files.
 */

GhostBuster.prototype.upgradeGhost = function(paths, version, callback) {

  var self = this,
    files;

  self.emit('progress', 'Upgrading/Downgrading Ghost to' + version);

  //cp *.js *.json *.md LICENSE ~/ghost - copy all .md .js .txt and .json files from this location to ~/ghost

  files = glob.sync(path.join(__dirname, '..', 'archive', 'ghost-' + version) + '/*.js');

  files.forEach(function(item) {

    fs.copySync(item, path.join(paths.cwd, path.basename(item)));

  });

  //fs.copySync(path.join(__dirname, 'archive', 'ghost-' + version) + "/index.js", paths.cwd  )

  files = glob.sync(path.join(__dirname, '..', 'archive', 'ghost-' + version) + '/*.json');

  files.forEach(function(item) {

    fs.copySync(item, path.join(paths.cwd, path.basename(item)));

  });

  files = glob.sync(path.join(__dirname, '..', 'archive', 'ghost-' + version) + '/*.md');

  files.forEach(function(item) {

    fs.copySync(item, path.join(paths.cwd, path.basename(item)));

  });


  // rm -rf ~/ghost/core - delete the old core directory

  fs.removeSync(path.join(paths.cwd, 'core'));

  fs.copySync(path.join(__dirname, '..', 'archive', 'ghost-' + version, 'core'), path.join(paths.cwd, 'core'));


  // cp -R content/themes/casper ~/ghost/content/themes - copy the casper directory and all of its contents to ~/ghost/content/themes

  fs.copySync(path.join(__dirname, '..', 'archive', 'ghost-' + version, 'content', 'themes', 'casper'), path.join(paths.cwd, 'content', 'themes'));


  callback();
};

/*
 * Copy the ghost-inject.js into the project directory
 */

GhostBuster.prototype.copyGhostInject = function(databaseLocation, paths, callback) {

  var self = this;

  self.emit('progress', 'copying  ghost-inject.js');

  if (!fs.existsSync(path.join(paths.cwd, 'ghost-inject.js'))) {

    FsTools.copy(paths.ghostInject, paths.cwdGhostInject, callback);

  } else {

    return callback(new Error('ghost-inject.js already exists'));

  }

};


/*
 * require('./ghost-inject') at the top of index.js
 */

GhostBuster.prototype.injectGhostInject = function(databaseLocation, paths, callback) {

  var self = this,
    file;

  self.emit('progress', 'moving  ghost-inject.js');

  if (fs.existsSync(paths.indexJs)) {

    self.emit('progress', 'inserting ghost-inject.js');

    file = fs.readFileSync(paths.indexJs, 'utf8');

    file = 'require(\'./ghost-inject\').setup();\n' + file;

    fs.writeFileSync(paths.indexJs, file);

  } else {

    return callback(new Error('index.js not found in ' + paths.indexJs));

  }

  callback();

};

/*
 * creates the config.js file
 */

GhostBuster.prototype.copyConfig = function(paths, callback) {

  var self = this;

  if (!fs.existsSync(path.join(paths.cwd, 'config.js'))) {

    self.emit('progress', 'No config.js found. Looking for config.example.js');

    if (fs.existsSync(path.join(paths.cwd, 'config.example.js'))) {

      self.emit('progress', 'Found config.example.js. Creating config.js from config.example.js');

      FsTools.copy(path.join(paths.cwd, 'config.example.js'), path.join(paths.cwd, 'config.js'), callback);

    } else {

      return callback(new Error('You have no config file and config.example.js was not found to copy'));

    }

  } else {

    self.emit('progress', 'Looks like you already have a config.js file. Editing the production variables...');

    callback();

  }

};

/*
 * Edits the config.js file
 */

GhostBuster.prototype.setupConfig = function(databaseLocation, paths, callback) {

  var self = this,
    file;

  if (fs.existsSync(path.join(paths.cwd, 'config.js'))) {

    self.emit('progress', 'setting up config file.');

    file = fs.readFileSync(path.join(paths.cwd, 'config.js'), 'utf8');

    file = customReplace(file, 'host: \'127.0.0.1\'', 'host: \'0.0.0.0\'', 2);

    file = customReplace(file, 'port: \'2368\'', 'port: (process.env.PORT || \'2368\')', 2);

    file = file.replace('http://my-ghost-blog.com', 'http://127.0.0.1:2368');

    file = file.replace('filename: path.join(__dirname, \'/content/data/ghost.db\')', ' filename: path.join(\'' + databaseLocation + '\')');

    fs.writeFileSync(path.join(paths.cwd, 'config.js'), file);

    self.emit('progress', '**Important** : Please set the urls in the config file correctly. The url for the dev environment has already been set for you.');

  } else {

    return callback(new Error('Something tragic happened. config.js wasn\'t found. '));

  }

  callback();

};


module.exports = new GhostBuster();

//------------------------------------------------------------------------------