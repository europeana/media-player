const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const path = require('path');
const webpack = require('webpack');

const config = function() {
  let conf = {
    mode: 'development',
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
    devtool: 'inline-source-map',
    devServer: {
      contentBase: './dev'
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin(),
        new OptimizeCssAssetsPlugin({
          cssProcessorPluginOptions: {
            discardComments: { removeAll: true }
          },
          canPrint: false
        })
      ]
    }
  };

  conf.plugins.push(new webpack.HotModuleReplacementPlugin());
  conf.plugins.push(new webpack.NoEmitOnErrorsPlugin());

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
    loaders: ['file-loader', {
      loader: 'image-webpack-loader'
    }]
  };
};

const icoRule = function() {
  return {
    test: /favicon\.ico$/,
    loader: 'url-loader',
    query: {
      limit: 1,
      name: '[name].[ext]'
    }
  };
};

const output = function() {
  return {
    filename: 'europeana-media-player.min.js',
    library: 'EuropeanaMediaPlayer',
    libraryExport: 'default',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/'
  };
};

const externals = function() {
  let externals = {};
  return externals;
};

const plugins = function() {
  let plugins = [];
  plugins = [new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    'window.$': 'jquery'
  })];

  return plugins;
};

module.exports = config();
