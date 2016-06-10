#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var shell = require('shelljs');
var root = require('app-root-path').toString();

var pkgPath = path.resolve(root, 'package.json');
var pkg = require(pkgPath);

var defaultTest = 'echo "Error: no test specified" && exit 1';
var hopsTest = 'tape -r hops/shims/test \'!(node_modules)/**/*.test.js\' | faucet';

Object.assign(pkg, {
  main: (shell.test('-e', pkg.main)) ? pkg.main : 'src/main.js',
  scripts: Object.assign(
    {
      start: '[ \"$NODE_ENV\" != "production" ] && npm run watch || npm run build',
      watch: 'BABEL_ENV=webpack webpack-dev-server --hot',
      build: 'BABEL_ENV=webpack webpack --progress || true'
    },
    pkg.scripts,
    {
      test: (pkg.scripts.test === defaultTest) ? hopsTest : pkg.scripts.test
    }
  ),
  babel: Object.assign({ extends: 'hops/etc/babel' }, pkg.babel)
});

var srcDir = path.resolve(__dirname, '..', 'app');
var template = [{
  source: path.join(srcDir, 'src'),
  destination: path.join(root, 'src')
}, {
  source: path.join(srcDir, '.eslintrc.js'),
  destination: path.join(root, '.eslintrc.js')
}, {
  source: path.join(srcDir, '.stylelintrc.js'),
  destination: path.join(root, '.stylelintrc.js')
}, {
  source: path.join(srcDir, 'webpack.config.js'),
  destination: path.join(root, 'webpack.config.js')
}];

function configure() {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  shell.echo('updated package.json');
}

function bootstrap() {
  template.forEach(function (file) {
    if (!shell.test('-e', file.destination)) {
      var destDir = path.dirname(file.destination);
      shell.mkdir('-p', destDir);
      shell.cp('-r', file.source, destDir);
      shell.echo('created ' + file.destination.replace(destDir + '/', ''));
    }
  });
}

function isBootstrapped() {
  var index = template.findIndex(function (file) {
    return shell.test('-e', file.destination);
  });
  return index >= 0;
}

if (
  require.main === module &&
  path.resolve(__dirname, '..') !== root &&
  !shell.test('-e', path.join(root, pkg.main)) &&
  !isBootstrapped()
) {
  configure();
  bootstrap();
}

exports.configure = configure;
exports.bootstrap = bootstrap;
