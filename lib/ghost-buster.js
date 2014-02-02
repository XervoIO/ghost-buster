var fs = require('fs-extra'),
  async = require('async'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  path = require('path'),
  FsTools = require('fs-tools'),
  cwd = process.cwd(),
  glob = require("glob");

//------------------------------------------------------------------------------
var GhostBuster = function() {

};

util.inherits(GhostBuster, EventEmitter);

//------------------------------------------------------------------------------
GhostBuster.prototype.convert = function(ghostVersion, databaseLocation, callback) {

  var self = this;

  self.paths = {
    serverJs: path.join(cwd, 'core', 'server.js'),
    adminJs: path.join(cwd, 'core', 'server', 'controllers', 'admin.js'),
    indexJs: path.join(cwd, 'index.js'),
    ghostInject: path.join(__dirname, 'ghost-inject.js'),
    modulusFileSystem: path.join(__dirname, 'modulusfilesystem.js'),
    cwdModulusFileSystem: path.join(cwd, 'core', 'server', 'storage', 'modulusfilesystem.js'),
    storageIndex: path.join(cwd, 'core', 'server', 'storage', 'index.js'),
    ghostLocalInject: path.join(__dirname, 'ghost-inject-local.js'),
    cwd: cwd,
    cwdGhostInject: path.join(cwd, 'ghost-inject.js'),
    cwdGhostLocalInject: path.join(cwd, 'ghost-inject-local.js'),
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
    ghostLocalInject: path.join(__dirname, 'ghost-inject-local.js'),
    cwd: cwd,
    cwdGhostInject: path.join(cwd, 'ghost-inject.js'),
    cwdGhostLocalInject: path.join(cwd, 'ghost-inject-local.js'),
  };

  async.series([

    function(callback) {
      self.checkPackageDotJson(self.paths, callback);
    },
    function(callback) {
      self.upgradeGhost(self.paths, callback);
    }
  ], callback);

};



//------------------------------------------------------------------------------

/*
 * Checks to see if ghost-buster has already been ran.
 */

GhostBuster.prototype.checkIfClean = function(paths, callback) {

  var self = this;

  if (!fs.existsSync(path.join(paths.cwd, 'ghost-inject.js')) || !fs.existsSync(path.join(paths.cwd, 'ghost-inject-local.js'))) {

    callback();

  } else {

    return callback(new Error("Looks like ghost-buster was already ran."));

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

GhostBuster.prototype.upgradeGhost = function(paths, callback) {

  var self = this,
    file;

  console.log("Adding upgrade");


  //cp *.js *.json *.md LICENSE ~/ghost - copy all .md .js .txt and .json files from this location to ~/ghost


  var files = glob.sync(path.join(__dirname, '..', 'archive', 'ghost-0.4.0') + "/*.js");

  files.forEach(function(item) {

    console.log(item);

    fs.copySync(item, path.join(paths.cwd, path.basename(item)));

  });

  //fs.copySync(path.join(__dirname, 'archive', 'ghost-0.4.0') + "/index.js", paths.cwd  )

  files = glob.sync(path.join(__dirname, '..', 'archive', 'ghost-0.4.0') + "/*.json");

  files.forEach(function(item) {

    console.log(item);

    fs.copySync(item, path.join(paths.cwd, path.basename(item)));

  });

  files = glob.sync(path.join(__dirname, '..', 'archive', 'ghost-0.4.0') + "/*.md");

  files.forEach(function(item) {

    console.log(item);

    fs.copySync(item, path.join(paths.cwd, path.basename(item)));

  });


  console.log("deleteing upgrade");

  // rm -rf ~/ghost/core - delete the old core directory

  deleteFolderRecursive(path.join(paths.cwd, 'core'));

  fs.copySync(path.join(__dirname, '..', 'archive', 'ghost-0.4.0', 'core'), path.join(paths.cwd, 'core'));



  // cp -R content/themes/casper ~/ghost/content/themes - copy the casper directory and all of its contents to ~/ghost/content/themes

  fs.copySync(path.join(__dirname, '..', 'archive', 'ghost-0.4.0', 'content', 'themes', 'casper'), path.join(paths.cwd, 'content', 'themes'));


  callback();
};

/*
 * Copy the ghost-inject.js into the project directory
 */

GhostBuster.prototype.copyGhostInject = function(databaseLocation, paths, callback) {

  var self = this;

  console.log("copyGhostInject");
  console.log(databaseLocation);

  if (databaseLocation) {

    self.emit('progress', 'copying  ghost-inject-local.js');

    if (!fs.existsSync(path.join(paths.cwd, 'ghost-inject-local.js'))) {

      FsTools.copy(paths.ghostLocalInject, paths.cwdGhostLocalInject, callback);

    } else {

      return callback(new Error("ghost-inject-local.js already exists"));

    }

  } else {

    self.emit('progress', 'copying  ghost-inject.js');

    if (!fs.existsSync(path.join(paths.cwd, 'ghost-inject.js'))) {

      FsTools.copy(paths.ghostInject, paths.cwdGhostInject, callback);

    } else {

      return callback(new Error("ghost-inject.js already exists"));

    }
  }

};


/*
 * require('./ghost-inject') at the top of index.js
 */

GhostBuster.prototype.injectGhostInject = function(databaseLocation, paths, callback) {

  var self = this;

  self.emit('progress', 'moving  ghost-inject.js');

  if (fs.existsSync(paths.indexJs)) {

    if (databaseLocation) {

      self.emit('progress', 'inserting ghost-inject-local.js');

      file = fs.readFileSync(paths.indexJs, 'utf8');

      file = "require('./ghost-inject-local').setup();\n" + file;

      fs.writeFileSync(paths.indexJs, file);

    } else {

      self.emit('progress', 'inserting ghost-inject.js');

      file = fs.readFileSync(paths.indexJs, 'utf8');

      file = "require('./ghost-inject').setup();\n" + file;

      fs.writeFileSync(paths.indexJs, file);


    }

  } else {

    return callback(new Error("index.js not found in " + paths.indexJs));

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

      return callback(new Error("You have no config file and config.example.js was not found to copy"));

    }

  } else {

    self.emit('progress', "Looks like you already have a config.js file. Editing the production variables...");

    callback();

  }

};

/*
 * Edits the config.js file
 */

GhostBuster.prototype.setupConfig = function(databaseLocation, paths, callback) {

  var self = this;

  if (fs.existsSync(path.join(paths.cwd, 'config.js'))) {

    self.emit('progress', 'setting up config file.');

    file = fs.readFileSync(path.join(paths.cwd, 'config.js'), 'utf8');

    file = CustomReplace(file, "host: '127.0.0.1'", "host: '0.0.0.0'", 2);

    file = CustomReplace(file, "port: '2368'", "port: (process.env.PORT || '2368')", 2);

    file = file.replace("http://my-ghost-blog.com", "http://127.0.0.1:2368");

    file = file.replace("filename: path.join(__dirname, '/content/data/ghost.db')", " filename: path.join('" + databaseLocation + "')");




    fs.writeFileSync(path.join(paths.cwd, 'config.js'), file);

    self.emit('progress', '**Important** : Please set the urls in the config file correctly. Otherwise, image uploads won\'t work. The url for the dev environment has already been set for you.');

  } else {

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
}

var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};