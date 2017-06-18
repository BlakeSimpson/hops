'use strict';

var webpack = require('webpack');
var ManifestPlugin = require('webpack-manifest-plugin');

var hopsConfig = require('..');

var watchOptions = {
  aggregateTimeout: 300,
  ignored: /node_modules/
};

module.exports = {
  entry: [
    'webpack-dev-server/client?' + hopsConfig.address,
    'webpack/hot/dev-server',
    require.resolve('../lib/hot-shim')
  ],
  output: {
    path: hopsConfig.buildDir,
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: 'chunk-[id].js'
  },
  context: hopsConfig.appDir,
  resolve: require('../lib/resolve-config')('develop'),
  module: {
    rules: require('../lib/loader-config')('develop')
  },
  plugins: require('../lib/plugin-config')('develop', [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new ManifestPlugin({
      writeToFileEmit: true,
      publicPath: '/'
    }),
    new webpack.EnvironmentPlugin({
      'NODE_ENV': 'development'
    })
  ]),
  performance: {
    hints: false
  },
  devtool: '#source-map',
  watchOptions: watchOptions,
  devServer: require('../lib/server-config')(watchOptions)
};
