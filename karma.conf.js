const files = function() {
  return [
    { pattern: './spec/**/*.js', watched: true, type: 'module'  },
    'https://code.jquery.com/jquery-3.4.1.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'
  ];
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

const customLaunchers = function() {
  return {
    chromeTravisCi: {
      base: 'ChromeHeadless',
      flags: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    }
  };
};

const webpack = () => {
  return {
    cache: true,
    devtool: 'inline-source-map',
    module: {
      rules: rules()
    }
  }
};

const rules = () => {
  return [{
    enforce: 'pre',
    test: /.spec\.js$/,
    include: /spec/,
    exclude: /node_modules/,
    use: [{ loader: 'babel-loader' }]
  },
  {
    enforce: 'pre',
    test: /\.js$/,
    include: /src/,
    exclude: /node_modules/,
    use: [{ loader: 'istanbul-instrumenter-loader', query: { esModules: true } }]
  },
  {
    test: /\.js$/,
    include: /src/,
    exclude: /node_modules|spec/,
    use: [{ loader: 'babel-loader' }]
  },
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
  }]
};

const webpackMiddleware = function() {
  return {
    //turn off webpack bash output when run the tests
    noInfo: true,
    stats: 'errors-only'
  };
}

const configuration = {
  //logLevel: 'DEBUG',
  basePath: '',
  exclude: [],
  files: files(),
  autoWatch: true,
  singleRun: true,
  failOnEmptyTestSuite: false,
  frameworks: ['jasmine'],
  browsers: ['Chrome' /*,'PhantomJS','Firefox','Edge','ChromeCanary','Opera','IE','Safari'*/],
  reporters: ['progress', 'spec', 'coverage'],//, 'kjhtml', 'dots', ],
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
  webpack: webpack(),
  preprocessors: {
    //add webpack as preprocessor to support require() in test-suits .js files
    './spec/**/*.js': ['webpack'],
    './src/**/*.js': ['webpack', 'coverage'],
  },
  coverageIstanbulReporter: {
    dir : 'coverage/',
    reports: [ 'html' ],
    fixWebpackSourcePaths: true
  },

  webpackMiddleware: webpackMiddleware(),
  customLaunchers: customLaunchers()
};

if (process.env.TRAVIS) {
  configuration.browsers = ['chromeTravisCi'];
}

module.exports = function(config) {
  config.set(configuration);
};
