'use strict';

var webpack = require('webpack');
var ManifestPlugin = require('webpack-manifest-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var BabiliPlugin = require('babili-webpack-plugin');

var HopsPlugin = require('hops-plugin');
var WriteFilePlugin = require('../lib/write-file');
var hopsConfig = require('..');

module.exports = {
  entry: require.resolve('../shims/build'),
  output: {
    path: hopsConfig.buildDir,
    publicPath: '/',
    filename: '[name]-[chunkhash:16].js',
    chunkFilename: 'chunk-[id]-[chunkhash:16].js'
  },
  context: hopsConfig.appDir,
  resolve: require('../sections/resolve')('build'),
  module: {
    rules: require('../sections/module-rules')('build')
  },
  plugins: [
    new ManifestPlugin({
      publicPath: '/'
    }),
    new WriteFilePlugin(/^manifest\.js(on)?$/),
    new HopsPlugin(
      hopsConfig.locations,
      require(hopsConfig.nodeConfig)
    ),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        if (module.resource && (/^.*\.css$/).test(module.resource)) {
          return false;
        }
        return module.context && module.context.indexOf('node_modules') > -1;
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      filename: 'manifest.js',
      minChunks: Infinity
    }),
    new webpack.HashedModuleIdsPlugin(),
    new ExtractTextPlugin({
      filename: '[name]-[contenthash:16].css',
      allChunks: true,
      ignoreOrder: true
    }),
    new webpack.EnvironmentPlugin({
      'NODE_ENV': 'production'
    }),
    new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
      sourceMap: false
    }),
    new BabiliPlugin(
      { evaluate: false },
      { comments: false }
    )
  ]
};
