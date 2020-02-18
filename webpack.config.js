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
      rules:
        rules()
    },
    output:
      output(),
    externals:
      externals(),
    plugins:
      plugins(),
    node: {
      fs: 'empty'
    },
    devtool: (mode === 'development') ? 'inline-source-map': false
  };

  if (mode === 'development') {
    conf.plugins.push(new webpack.HotModuleReplacementPlugin());
    conf.plugins.push(new webpack.NoEmitOnErrorsPlugin());
  }

  return conf;
};

const rules = function() {
  let rules =
    [
      jsRule(), htmlRule(), cssRule(), pngRule()
    ];

  return rules;
};

const jsRule = function() {
  let jsRule = {
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['env']
      }
    }
  };

  return jsRule;
};

const htmlRule = function() {
  let htmlRule = {
    test: /\.html$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: 'html-loader',
      options: {}
    }
  };

  return htmlRule;
};

const cssRule = function() {
  let cssRule = {
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
  };

  return cssRule;
};

const pngRule = function() {
  let pngRule = {
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
  };

  return pngRule;
};

const output = function() {
  let output = {
    publicPath: '/',
    path: path.resolve(__dirname, './lib'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  };

  return output;
};

const externals = function() {
  let externals = {
    jquery: 'jquery',
    dashjs: 'dashjs'
  };

  return externals;
};

const plugins = function() {
  let plugins = [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery'
    })
  ];

  return plugins;
};

module.exports = config(process.env.NODE_ENV);
