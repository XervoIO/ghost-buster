var path = require('path');


exports.setup = function() {

  process.env.TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, '/content/data');

  process.env.CLOUD_DIR = process.env.CLOUD_DIR || path.join(process.cwd(), '/content');

};