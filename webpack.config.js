require('dotenv').config();

const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

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
    devtool: (mode === 'development') ? 'inline-source-map': false,
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin(),
        new OptimizeCssAssetsPlugin({
          cssProcessorPluginOptions: {
             discardComments: { removeAll: true },
          },
          canPrint: false
        })
      ]
    }
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
      jsRule(), htmlRule(), cssRule(), fontRule(), pngRule()
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
  return {
    test: /\.[s]?css$/,
    use: [
      'style-loader',
      { loader: 'css-loader', options: { sourceMap: true} },
      { loader: 'sass-loader', options: { sourceMap: true } }
    ]
  };
};

const fontRule = () => {
  return {
    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
    use: ['url-loader?limit=100000&mimetype=application/font-woff']
  }
}

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
  let externals = {};
  if (process.env.NODE_ENV !== "development") {
    externals = {
      jquery: 'jquery',
      dashjs: 'dashjs',
      'webpack-jquery-ui/slider': 'webpack-jquery-ui/slider',
      'webpack-jquery-ui/effects': 'webpack-jquery-ui/effects',
    };
  }
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
