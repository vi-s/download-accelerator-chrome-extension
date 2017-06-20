/**
 * Webpack config file to transpile background.js as a webworker instead of normal web target
 */

var webpack = require('webpack');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var helpers = require('./webpack.helpers.js');

module.exports = {
  target: 'webworker',
  devtool: 'source-map',
  // Entry files for webpack to bundle into 3 chunk files
  entry: {
    'background': './webpack_entry/background.js'
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
        /**
         * LESSON LEARNED: Don't limit the test param scope to sth like
         * just /background\.js/ , we want to target *.js files for the 
         * babel loader... otherwise only background.js gets transpiled,
         * none of the helper files will, thus we run into UglifyJS which 
         * doesn't support es6.
         */
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },

  plugins: [
    new ProgressBarPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618
      mangle: {
        keep_fnames: true
      },
      sourceMap: true
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};
