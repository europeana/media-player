const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html';
module.exports = {
   tags: ['skip-firefox'],
   beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible('.button-play')
     .waitForElementVisible('.canvas-time');
   },
   /*
  'Using slider to scrub video': (browser) => {
    browser
      .assert.attributeContains('.ui-slider-handle', 'style', 'left: 0')
      .moveToElement('.ui-corner-all', 0, 0)
      .mouseButtonDown(0)
      .moveToElement('.ui-corner-all', 200, 0)
      .mouseButtonUp(0)
      .assert.containsText('.canvas-time', '00:24')
      .moveToElement('.ui-corner-all', 200, 0)
      .mouseButtonDown(0)
      .moveToElement('.ui-corner-all', 760, 0)
      .mouseButtonUp(0)
      .getText('.canvas-time', function(result) {
        console.log('.canvas-time = actual = ' + result);
      })
      .assert.containsText('.canvas-time', '01:29')
      .end()
  },
  */
  'Volume controls': (browser) => {
    browser
      .assert.attributeEquals('.volume-mute', 'title','Mute')
      .moveToElement('.volume-slider', 0, 4)
      .mouseButtonClick(0)
      .assert.attributeEquals('.volume-mute', 'title','Unmute')
      .moveToElement('.volume-slider', 70, 2)
      .mouseButtonClick(0)
      .assert.attributeEquals('.volume-mute', 'title','Mute')
      .end()
  },
  after: (browser) => {
    browser.end();
  }
};
