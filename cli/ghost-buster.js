var program = require('commander'),
  ghostBuster = require('../lib/ghost-buster'),
  path = require('path'),
  fs = require('fs'),
  cwd = process.cwd();

program
  .version('0.0.7')
  .option('-db, --database [pathtodb]', 'Pushing Local blog at [path]instead of syncing with cloud storage')
  .option('-g, --ghostversion [ghostversion]', 'Version of Ghost (Otherwise useing version from package.json)')
  .option('-u, --upgrade', "Upgrade Ghost (Doesn't automatically run ghost-buster)")
  .parse(process.argv);


ghostBuster.on('progress', function(msg) {

  console.log(msg);

});


if (!program.upgrade) {

  if (program.db) {

    program.db = path.join(cwd, "content", "data", "ghost.db");

  }

  if (!program.ghostversion) {

    var meta = require(path.join(cwd, 'package.json'));

    program.ghostversion = meta.version;

  }


  ghostBuster.convert(program.local, program.ghostversion, function(err) {

    if (err) {

      console.log('ERROR: ' + err);

    } else {

      console.log('Ghost Busted.');

    }

  });

} else {

  console.log('Upgrading...');

  ghostBuster.upgrade(function(err) {

    if (err) {

      console.log('ERROR: ' + err);

    } else {

      console.log('Ghost Successfully upgrade. Please run ghost-buster.');

    }

  });


}