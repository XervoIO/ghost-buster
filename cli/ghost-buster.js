var program = require('commander'),
    ghostBuster = require('../lib/ghost-buster'),
    path = require('path'),
    fs = require('fs'),
    cwd = process.cwd();

program
  .version('0.0.7')
  .option('-l, --local [pathtodb]', 'Pushing Local blog at [path]instead of syncing with cloud storage')
  .option('-g, --ghostversion [ghostversion]', 'Version of Ghost (Otherwise useing version from package.json)')
  .parse(process.argv);


ghostBuster.on('progress', function(msg) {

  console.log(msg);

});

process.env.GHOST_LOCAL = 0;

if(program.local){

  process.env.GHOST_LOCAL = 1;

  if(!fs.existsSync(program.local)){

    //TODO: Check to make sure the local file is inside of pwd

    console.log("Please Include a path to a DB.");

    return;

  }

}

if(!program.ghostversion){

  var meta = require(path.join(cwd, 'package.json'));

  program.ghostversion = meta.version;

}

process.env.GHOST_VERSION = program.ghostversion;


ghostBuster.convert(program.local, function(err) {

  if(err) {
  
    console.log('ERROR: ' + err);
  
  }
  
  else {
  
    console.log('Ghost Busted.');
  
  }

});
