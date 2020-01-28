require('dotenv').config();

const path = require('path');
const webpack = require('webpack');
const libraryName = 'europeanamediaplayer';
const outputFile = libraryName + '.js';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const config = function(mode) {
  let conf = {
    mode,
    entry: ['./src/index.js'],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env']
            }
          }
        },
        {
          test: /\.html$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'html-loader',
            options: {}
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /.*\.png$/i,
          loaders: [ 'file-loader', {
            loader: 'image-webpack-loader',
            query: {
              progressive: true,
              pngquant: {
                quality: '65-90',
                speed: 4
              }
            }
          }
          ]
        }
      ]
    },
    output: {
      publicPath: '/',
      path: path.resolve(__dirname, './lib'),
      filename: outputFile,
      library: libraryName,
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    externals: {
      jquery: 'jQuery',
      dashjs: 'dashjs'
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        'window.$': 'jquery'
      })
    ],
    node: {
      fs: 'empty'
    },
    devtool: 'nosources-source-map'
  };

  if (mode === 'development') {
    conf.plugins.push(new webpack.HotModuleReplacementPlugin());
    conf.plugins.push(new webpack.NoEmitOnErrorsPlugin());
  }

  return conf;
};

module.exports = config(process.env.NODE_ENV);
