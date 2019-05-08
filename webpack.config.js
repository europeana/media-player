const path = require('path')
var webpack = require('webpack')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
process.env.EUPS_PORT = process.env.EUPS_PORT || 9000

const config = function (mode) {
    let conf = {
        mode: mode,
        entry: ['./src/index.js'],
        resolve: {
            alias: {
                "jqueryui": "jqueryui/jquery-ui.js"
            }
        },
        module: {
            rules: [
            {
                test: /node_modules[\\\/]vis[\\\/].*\.js$/, // vis.js files
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: [ "babel-preset-es2015" ].map(require.resolve),
                    plugins: [
                        "transform-es3-property-literals", // see https://github.com/almende/vis/pull/2452
                        "transform-es3-member-expression-literals", // see https://github.com/almende/vis/pull/2566
                        "transform-runtime" // see https://github.com/almende/vis/pull/2566
                    ]
                }
            }, 
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
            path: path.resolve(__dirname, 'public/'),
            filename: 'bundle.js',
            publicPath: '/',
        },
        plugins: [ 
            new webpack.ProvidePlugin({
                jQuery: 'jquery',
                $: 'jquery',
                jquery: 'jquery'
            }),
        ],
        devServer: {
            watchOptions: {
                ignored: /node_modules/
            },
            contentBase: 'public',
            compress: true,
            hot: true,
            port: process.env.EUPS_PORT
        }
    }

    if (mode === 'development') {
        conf.plugins.push(new webpack.HotModuleReplacementPlugin())
        conf.plugins.push(new webpack.NoEmitOnErrorsPlugin())
    }

    return conf
}

module.exports = config(process.env.NODE_ENV)