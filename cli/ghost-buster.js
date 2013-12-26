var program = require('commander'),
    ghostBuster = require('../lib/ghost-buster'),
    path = require('path'),
    fs = require('fs');

program
  .version('0.0.7')
  .option('-l, --local [path]', 'Pushing Local blog at [path]instead of syncing with cloud storage')
  .parse(process.argv);


ghostBuster.on('progress', function(msg) {

  console.log(msg);

});

if(program.local){

  console.log(program.local);

  if(!fs.existsSync(program.local)){

    //TODO: Check to make sure the local file is inside of pwd

    console.log("Local should be a file");

    return;

  }

}



ghostBuster.convert(program.local, function(err) {

  if(err) {
  
    console.log('ERROR: ' + err);
  
  }
  
  else {
  
    console.log('Ghost Busted.');
  
  }

});
