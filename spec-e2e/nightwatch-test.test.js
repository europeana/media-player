module.exports = { 
  'Clicking play': (browser) => {
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .waitForElementVisible('.button-play', 5000)
      .waitForElementVisible('.canvas-time', 5000)
      .assert.containsText('.canvas-time', '00:01')
      .click('.button-play')
      .waitForElementVisible('.pause', 5000)
      .assert.attributeContains('.button-play', 'title', 'Pause')
      .assert.not.containsText('.canvas-time', '00:01')
      .end()
  },
  'Clicking play and then pause': (browser) => {
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .waitForElementVisible('.button-play', 5000)
      .click('.button-play')
      .waitForElementVisible('.pause', 5000)
      .click('.button-play')
      .waitForElementVisible('.play', 5000)
      .end()
  },
  'Using slider to scrub to 00:13': (browser) => {
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .waitForElementVisible('.ui-corner-all', 5000)
      .moveToElement('.ui-corner-all', 0, 0)
      .mouseButtonDown(0)
      .moveToElement('.ui-corner-all', 200, 0)
      .mouseButtonUp(0)
      .assert.containsText('.canvas-time', '00:13')
      .end()
  }, 
  'Clicking fullscreen': (browser) => {
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .waitForElementVisible('.av-icon-fullscreen', 5000)
      .click('.av-icon-fullscreen')
      .waitForElementVisible('.play', 5000)
      .end()
  }, 
  after: (browser)=> {
      browser.end()
  }
};
