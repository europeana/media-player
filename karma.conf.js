const includeCoverage = process.argv[3] && process.argv[3].match('coverage');
const webpack = require('webpack');

const files = function() {
  return [
  {
    pattern: `./tests/spec/**/*.spec.js`, watched: true, type: 'module' },
    'https://code.jquery.com/jquery-3.4.1.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'
    //'http://localhost:9876/base/spec/fixture-data/jquery-3.4.1.min.js',
    //'http://localhost:9876/base/spec/fixture-data/jquery-ui.min.js'
  ]
  .concat(
    ['jpg', 'json', 'mp3', 'mp4', 'mov', 'webm', 'm4v', 'wmv'].map((ext) => {
      return {
        pattern:  `./tests/fixture-data/*.${ext}`,
        included: false,
        watched:  true,
        served:   true
      }
    })
  )
  .concat(
    ['json', 'mp4'].map((ext) => {
      return {
        pattern:  `./tests/fixture-data/EUscreen/*.${ext}`,
        included: false,
        watched:  true,
        served:   true
      }
    })
  );
};

const client = function() {
  return {
    captureConsole: false,
    clearContext: false,
    jasmine: {
      random: false
    }
  };
};

const webpackInit = () => {
  return {
    cache: true,
    devtool: 'inline-source-map',
    module: {
      rules: rules(),
    },
    plugins:
      plugins()
  }
};

const plugins = () => {
  return [ new webpack.DefinePlugin({
    'process.env': {
      EUSCREEN_INFO_URL: JSON.stringify(process.env.EUSCREEN_INFO_URL)
    }
  })]
};

const rules = () => {
  return [
    {
      test: /\.js$/,
      include: /src/,
      exclude: /node_modules|test/,
      loader: 'babel-loader'
    },
    {
      test: /\.[s]?css$/,
      loader: 'style-loader!css-loader!sass-loader'
    },
    {
      test: /favicon\.ico$/,
      loader: 'url-loader',
      query: {
        limit: 1,
        name: '[name].[ext]',
      }
    },
    ... includeCoverage ? [
      {
        enforce: 'pre',
        test: /.spec\.js$/,
        include: /tests\/spec/,
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader' }]
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        include: /src/,
        exclude: /node_modules/,
        use: [{ loader: 'istanbul-instrumenter-loader', query: { esModules: true } }]
      }
    ] : []
  ];
};

const webpackMiddleware = function() {
  return {
    //turn off webpack bash output when run the tests
    noInfo: true,
    stats: 'errors-only'
  };
}

let configuration = {
  //logLevel: 'DEBUG',
  basePath: '',
  exclude: [],
  files: files(),
  autoWatch: true,
  singleRun: true,
  failOnEmptyTestSuite: false,
  frameworks: ['jasmine'],
  browsers: ['Chrome' /*,'PhantomJS','Firefox','Edge','ChromeCanary','Opera','IE','Safari'*/],
  reporters: ['progress', 'kjhtml', 'spec', ... includeCoverage ? ['coverage'] : []],
  //address that the server will listen on, '0.0.0.0' is default
  listenAddress: '0.0.0.0',
  //hostname to be used when capturing browsers, 'localhost' is default
  hostname: 'localhost',
  //the port where the web server will be listening, 9876 is default
  port: 9876,
  //when a browser crashes, karma will try to relaunch, 2 is default
  retryLimit: 0,
  //how long does Karma wait for a browser to reconnect, 2000 is default
  browserDisconnectTimeout: 5000,
  //how long will Karma wait for a message from a browser before disconnecting from it, 10000 is default
  browserNoActivityTimeout: 10000,
  //timeout for capturing a browser, 60000 is default
  captureTimeout: 60000,
  client: client(),
  webpack: webpackInit(),
  preprocessors: {
    './tests/spec/**/*.js': ['webpack', 'sourcemap'],
    './src/**/*.js': ['webpack', 'sourcemap', ... includeCoverage ? ['coverage'] : []],
  },
  webpackMiddleware: webpackMiddleware()
};

if(includeCoverage){
  configuration.coverageIstanbulReporter = {
    dir : 'coverage/',
    reports: [ 'html' ],
    fixWebpackSourcePaths: true
  };
}

module.exports = function(config) {
  config.set(configuration);
};
