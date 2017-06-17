var webpack = require('webpack');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var helpers = require('./webpack.helpers.js');

/**
 * Webpack config file to transpile background.js as a webworker instead of normal web target
 */

module.exports = {
  target: 'webworker',
  devtool: 'source-map',
  // Entry files for webpack to bundle into 3 chunk files
  entry: {
    'background': './background.js'
  },

  // in import statement, this tells webpack to try matching extensionless files with the below 2
  resolve: {
    extensions: ['.js']
  },

  output: {
    path: helpers.root('dist'),
    publicPath: './',
    filename: '[name].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  module: {
    rules: [
      {
        // JS LOADER
        // Reference: https://github.com/babel/babel-loader
        // Transpile .js files using babel-loader
        // Compiles ES6 and ES7 into ES5 code
        test: /background\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },

  plugins: [
    new ProgressBarPlugin(),
    new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618
      mangle: {
        keep_fnames: true
      },
      sourceMap: true
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};
