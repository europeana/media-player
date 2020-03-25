module.exports = { 
  'Clicking play': (browser) => { 
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .waitForElementVisible('.button-play', 5000)
      .waitForElementVisible('.canvas-time', 5000)
      .assert.containsText('.canvas-time', '00:01')
      .assert.attributeContains('.button-play', 'title', 'Play')
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
      .pause(2000)
      .assert.not.containsText('.canvas-time', '00:01')
      .assert.attributeContains('.button-play', 'title', 'Pause')
      .click('.button-play')
      .assert.attributeContains('.button-play', 'title', 'Play')
      .end()
  }, 
  'Using slider to scrub video': (browser) => {
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .waitForElementVisible('.ui-corner-all', 5000)
      .assert.attributeContains('.ui-slider-handle', 'style', 'left: 0')
      .moveToElement('.ui-corner-all', 0, 0)
      .mouseButtonDown(0)
      .moveToElement('.ui-corner-all', 200, 0)
      .mouseButtonUp(0)
      .assert.containsText('.canvas-time', '00:13')
      .assert.attributeContains('.ui-slider-handle', 'style', 'left: 14')
      .moveToElement('.ui-corner-all', 200, 0)
      .mouseButtonDown(0)
      .moveToElement('.ui-corner-all', 760, 0)
      .mouseButtonUp(0)
      .assert.containsText('.canvas-time', '00:49')
      .assert.attributeContains('.ui-slider-handle', 'style', 'left: 56')
      .end()
  }, 
  'Maximising & minimising the player': (browser) => {
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .waitForElementVisible('.av-icon-fullscreen', 5000)
      .getElementSize('.canvas-container', function (result) {
        this.assert.ok(result.value.height < '500', 'Checking to see if the height of the element is smaller than 500px before clicking fullscreen.')
      })    
      .click('.av-icon-fullscreen')
      .getElementSize('.canvas-container', function (result) {
        this.assert.ok(result.value.width > '1000', 'Checking to see if the width of the element is greater than 1000px after clicking fullscreen.');
        this.assert.ok(result.value.height > '500', 'Checking to see if the height of the element is greater than 500px after clicking fullscreen.');
      })      
      .waitForElementVisible('.play', 5000)
      .click('.av-icon-fullscreen')
      .getElementSize('.canvas-container', function (result) {
        this.assert.ok(result.value.height < '500', 'Checking to see if the height of the element is smaller than 500px after leaving fullscreen.')
      })
      .waitForElementVisible('.play', 5000)
      .end()
    
    },
  'Volume controls': (browser) => {
    browser
      .url('http://127.0.0.1:8081/spec/fixture-data/index.html')
      .waitForElementVisible('.volume-slider', 5000)
      .assert.attributeEquals('.volume-mute', 'title','Mute')
      .moveToElement('.volume-slider', 0, 4)
      .mouseButtonClick(0)
      .assert.attributeEquals('.volume-mute', 'title','Unmute')
      .moveToElement('.volume-slider', 40, 4)
      .mouseButtonClick(0)
      .assert.attributeEquals('.volume-mute', 'title','Mute')
      .end()
  },
  after: (browser)=> {
      browser.end()
  }
};
