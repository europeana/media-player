require('dotenv').config();

const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const path = require('path');
const webpack = require('webpack');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const config = function(mode) {
  let conf = {
    mode,
    entry: ['babel-polyfill','./src/index.js'],
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
    resolve: {
      alias: {
        process: 'process/browser'
      },
      fallback: {
        fs: false,
        process: require.resolve('process/browser'),
        stream: require.resolve('stream-browserify')
      }
    },
    devtool: (mode === 'development') ? 'inline-source-map': false,
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin(),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
              },
            ]
          }
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
      jsRule(), htmlRule(), cssRule(), fontRule(), pngRule(), icoRule()
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
      { loader: 'css-loader', options: { sourceMap: true } },
      { loader: 'sass-loader', options: { sourceMap: true } }
    ]
  };
};

const fontRule = () => {
  return {
    test: /\.(woff|woff2|eot|ttf|svg)$/,
    use: ['url-loader?limit=100000&mimetype=application/font-woff']
  };
};

const pngRule = function() {
  return {
    test: /.*\.png$/i,
    use: [
      {
        loader: 'image-webpack-loader'
      }
    ]
  };
};

const icoRule = function() {
  return {
    test: /favicon\.ico$/,
    loader: 'url-loader',
    options: {
      limit: 1
    }
  }
};

const output = function() {
  return {
    filename: 'europeana-media-player.min.js',
    library: 'EuropeanaMediaPlayer',
    libraryExport: 'default',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
  };
};

const externals = function() {
  let externals = {};
  if (process.env.NODE_ENV !== 'development') {
    externals = {
      jquery: 'jquery',
      dashjs: 'dashjs',
      'webpack-jquery-ui/slider': 'webpack-jquery-ui/slider',
      'webpack-jquery-ui/effects': 'webpack-jquery-ui/effects'
    };
  }
  return externals;
};

const plugins = function() {
  let plugins = [];
  if (process.env.NODE_ENV === 'development') {
    plugins = [ new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        'window.$': 'jquery',
        process: 'process/browser'
      }),
      new webpack.DefinePlugin({
        'process.env.EUSCREEN_INFO_URL': JSON.stringify(process.env.EUSCREEN_INFO_URL)
      })
    ];
  } else {
    plugins = [ new webpack.DefinePlugin({
      'process.env.EUSCREEN_INFO_URL': JSON.stringify(process.env.EUSCREEN_INFO_URL)
      })
    ];
  }

  return plugins;
};

module.exports = config(process.env.NODE_ENV);
