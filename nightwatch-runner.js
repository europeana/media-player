process.env.NODE_ENV = 'development';
const server = require('./webpack-dev-server.js');

server.ready.then(() => {

  var opts = process.argv.slice(2);
  if (opts.indexOf('--config') === -1) {
    opts = opts.concat(['--config', 'tests/nightwatch.conf.js']);
  }

  var spawn = require('cross-spawn');
  var runner = spawn('./node_modules/.bin/nightwatch', opts, { stdio: 'inherit' });

  runner.on('exit', function (code) {
    server.close();
    process.exit(code);
  });

  runner.on('error', function (err) {
    server.close();
    throw err;
  });
});
