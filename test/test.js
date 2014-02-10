var assert = require('assert'),
  ghostBuster = require('../lib/ghost-buster');

describe('ghost-buster', function() {

  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  it('should have main methods', function() {
    assert.ok(ghostBuster.convert);
    assert.ok(ghostBuster.upgrade);
  });

});