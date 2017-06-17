/**
 * Webpack config to build extension front-end SPA code, common features, can
 * be extended to form another config for development in addition to production.
 */

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var helpers = require('./webpack.helpers.js');

module.exports = {
  // Entry files for webpack to bundle into 3 chunk files
  entry: {
    'app': './webpack_entry/app.js',
    'vendor': './webpack_entry/vendor.js',
    'polyfills': './webpack_entry/polyfills.js'
  },

  // in import statement, this tells webpack to try matching extensionless files with the below 2
  resolve: {
    extensions: ['.js', '.css']
  },

  // NOT COMMON, must be changed for future projects
  output: {
    path: __dirname + '/dist',
  },

  module: {
    rules: [
      {
        // JS LOADER
        // Reference: https://github.com/babel/babel-loader
        // Transpile .js files using babel-loader
        // Compiles ES6 and ES7 into ES5 code
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        // use this form with hash for cache busting:
        //         loader: 'file-loader?name=assets/[name].[hash].[ext]'
        loader: 'file-loader?name=assets/[name].[ext]'
      },
      {
        test: /\.css$/,
        exclude: helpers.root('src', 'app'),
        loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader?sourceMap' })
      }
    ]
  },

  plugins: [
    new ProgressBarPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),

    new HtmlWebpackPlugin({
      template: 'browseraction/_popup.html'
    })
  ]
};
