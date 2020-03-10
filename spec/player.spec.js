import * as index  from '../src/index';
let manifest = 'https://iiif.europeana.eu/presentation/08609/fe9c5449_9522_4a70_951b_ef0b27893ae9/manifest?format=3&wskey=api2demo';
describe('index functions', () => {

  describe('player tests', () => {
    it('should generate a unique player id', () => {
      let ids = {};
      let r = /^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/;
      for(var i=0; i<100; i++){
        let id = index.uuidv4();
        ids[id] = true;
        expect(Object.keys(ids).length).toEqual(i + 1);
        expect(id.match(r)).toBeTruthy();
      }
    });
  });

  describe('DOM checks', () => {

    beforeEach((done) => {
      const options = { mode: 'player', manifest: manifest };
      const videoObj = { manifest: manifest };
      const fixture = '<div class="player-wrapper"></div>';

      document.body.insertAdjacentHTML('afterbegin', fixture);
      let wrapperElement = document.querySelector('.player-wrapper');
      index.init(wrapperElement, videoObj, options);
      index.player.avcomponent.on('mediaready', function() {
        done();
      });
    });

    it('should load the player', () => {
      let playerElement = document.querySelector('.eups-player');
      expect(playerElement).toBeTruthy();
    });

    it('should contain a play button', () => {
      let playButton = document.querySelector('.button-play');
      expect(playButton).toBeTruthy();
    });

    it('should have a duration of 1:00', () => {
      let duration = document.querySelector('.canvas-duration');
      expect(duration.textContent).toContain('01:00');
    });
  });

});
