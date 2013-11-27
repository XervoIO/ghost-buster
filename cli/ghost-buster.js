var program = require('commander'),
    ghostBuster = require('../lib/ghost-buster'),
    path = require('path');

program
  .version('0.0.5')
  .parse(process.argv);


ghostBuster.on('progress', function(msg) {
  console.log(msg);
});

ghostBuster.convert(function(err) {
  if(err) {
    console.log('ERROR: ' + err);
  }
  else {
    console.log('Ghost Busted.');
  }
});
