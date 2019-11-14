require('dotenv').config();

const path = require('path');
var webpack = require('webpack');
const libraryName = 'europeanamediaplayer';
const outputFile = libraryName + '.js';

process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.EUPS_PORT = process.env.EUPS_PORT || 9000

const config = function (mode) {
    let conf = {
        mode: mode,
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
              use: ['style-loader', 'css-loader'],
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
        plugins: [ 
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery'",
                "window.$": "jquery"
            }),
            new webpack.EnvironmentPlugin(
                ['NODE_ENV', 'EDITOR']
            ),
        ],
        devServer: {
            watchOptions: {
                ignored: /node_modules/
            },
            contentBase: 'public',
            compress: true,
            hot: true,
            port: process.env.EUPS_PORT
        },
        node: {
            fs: 'empty'
        }, 
        devtool: 'nosources-source-map'
    }

    if (mode === 'development') {
        conf.plugins.push(new webpack.HotModuleReplacementPlugin())
        conf.plugins.push(new webpack.NoEmitOnErrorsPlugin())
    }

    return conf
}

module.exports = config(process.env.NODE_ENV)