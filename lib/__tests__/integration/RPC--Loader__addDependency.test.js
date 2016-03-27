'use strict';

const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const HappyPlugin = require('../../HappyPlugin');
const TestUtils = require('../../HappyTestUtils');
const { assert, } = require('../../HappyTestUtils');

describe('[Integration] Loader RPCs - this.addDependency()', function() {
  TestUtils.IntegrationSuite(this);

  it('works', function(done) {
    const loader = TestUtils.createLoader(function(s) {
      this.addDependency(this.resourcePath.replace('a.js', 'b.js'));

      return s;
    });

    const indexFile = TestUtils.createFile('integration/RPC--Loader__addDependency/a.js', '// a.js');
    const otherFile = TestUtils.createFile('integration/RPC--Loader__addDependency/b.js', '// b.js');

    const compiler = webpack({
      entry: indexFile.getPath(),
      output: {
        path: TestUtils.tempDir('integration-[guid]')
      },

      module: {
        loaders: [{
          test: /.js$/,
          loader: TestUtils.HAPPY_LOADER_PATH
        }]
      },

      plugins: [
        new HappyPlugin({
          loaders: [ loader.path ],
        })
      ]
    });

    compiler.run(function(err, rawStats) {
      if (err) return done(err);

      const stats = rawStats.toJson();

      assert.equal(stats.errors.length, 0);
      assert.equal(stats.warnings.length, 0);

      const contents = fs.readFileSync(TestUtils.getWebpackOutputBundlePath(rawStats), 'utf-8');

      assert.match(contents, '// a.js');

      done();
    });
  });
});