const target_url = 'http://127.0.0.1:8081/spec/fixture-data/index.html';
module.exports = { 
   beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible('.button-play')
     .waitForElementVisible('.canvas-time');
   }, 
  'Clicking play': (browser) => {
    browser
      .getText('.canvas-time', function(result) {
        console.log('.canvas-time: actual (1) = ' + JSON.stringify(result));
      })
      .assert.containsText('.canvas-time', '00:01')
      .assert.attributeContains('.button-play', 'title', 'Play')
      .click('.button-play')
      .waitForElementVisible('.pause')
      .assert.attributeContains('.button-play', 'title', 'Pause')
      .getText('.canvas-time', function(result) {
        console.log('.canvas-time: actual (2) = ' + JSON.stringify(result));
      })
      .assert.not.containsText('.canvas-time', '00:01')
      .end()
  },
  'Clicking play and then pause': (browser) => {
    browser
      .click('.button-play')
      .pause(2000)
      .assert.not.containsText('.canvas-time', '00:01')
      .assert.attributeContains('.button-play', 'title', 'Pause')
      .click('.button-play')
      .assert.attributeContains('.button-play', 'title', 'Play')
      .end()
  },
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
  'Maximising & minimising the player': (browser) => {
    browser
      .getElementSize('.canvas-container', function (result) {
        this.assert.ok(result.value.height < '500', 'Checking to see if the height of the element is smaller than 500px before clicking fullscreen.');
      })
      .click('.av-icon-fullscreen')
      .getElementSize('.canvas-container', function (result) {
        this.assert.ok(result.value.width > '1000', 'Checking to see if the width of the element is greater than 1000px after clicking fullscreen.');
        this.assert.ok(result.value.height > '500', 'Checking to see if the height of the element is greater than 500px after clicking fullscreen.');
      })
      .waitForElementVisible('.play')
      .click('.av-icon-fullscreen')
      .getElementSize('.canvas-container', function (result) {
        this.assert.ok(result.value.height < '500', 'Checking to see if the height of the element is smaller than 500px after leaving fullscreen.');
      })
      .end()
    }, 
  'Volume controls': (browser) => {
    browser
      .assert.attributeEquals('.volume-mute', 'title','Mute')
      .moveToElement('.volume-slider', 0, 4)
      .mouseButtonClick(0)
      .assert.attributeEquals('.volume-mute', 'title','Unmute')
      .moveToElement('.volume-slider', 70, 2)
      .mouseButtonClick(0)
      .assert.attributeEquals('.volume-mute', 'title','Mute')
      .pause(10000)
      .end()
  },
  'Subtitles are displayed.': (browser) => {
    browser
      .pause(1000)
      .waitForElementVisible('.av-icon-subtitles')
      .click('.av-icon-subtitles')
      .waitForElementVisible('.subtitlemenu-option')
      .assert.attributeEquals('.subtitlemenu-option', 'data-language', 'pl-PL')
      .assert.containsText('.subtitlemenu-option', 'Polski')
      .click('.subtitlemenu-option')
      .click('.button-play')
      .assert.not.visible('.subtitlemenu-option')
      .end()
  },
  after: (browser) => {
    browser.end();
  }
};
