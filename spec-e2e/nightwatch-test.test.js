module.exports = { 
  'Clicking play': (browser) => {
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .waitForElementVisible('.button-play', 5000)
      .waitForElementVisible('.canvas-time', 5000)
      .assert.containsText('.canvas-time', '00:01')
      .click('.button-play')
      .pause(2000)
      .assert.attributeContains('.button-play', 'title', 'Pause')
      .assert.not.containsText('.canvas-time', '00:01')
      .getValue('.canvas-time')
      .end()
  },
  after: (browser)=> {
      browser.end()
  }
};
