var program = require('commander'),
  ghostBuster = require('../lib/ghost-buster'),
  path = require('path'),
  cwd = process.cwd();

program
  .version('0.0.7')
  .option('-db, --database [pathtodb]', 'Pushing Local blog at [path]instead of syncing with cloud storage')
  .option('-u, --upgrade [ghostversion]', 'Upgrade Ghost (Doesn\'t automatically run ghost-buster)')
  .parse(process.argv);


ghostBuster.on('progress', function(msg) {

  console.log(msg);

});


if (!program.upgrade && !program.downgrade) {

  if (!program.db) program.db = path.join('content', 'data', 'ghost.db');

  ghostBuster.convert(program.db, function(err) {

    if (err) {

      console.log('ERROR: ' + err);

    } else {

      console.log('Ghost Busted.');

    }

  });

} else {

  console.log('Upgrading/Downgrading...');

  console.log((program.upgrade || program.downgrade));

  var version = (program.upgrade || program.downgrade);

  ghostBuster.upgrade(version, function(err) {

    if (err) {

      console.log('ERROR: ' + err);

    } else {

      console.log('Ghost Successfully upgrade. Please run ghost-buster.');

    }

  });

}