import * as empIndex  from '../../src/index';

const $ = require("jquery");
import * as pEvents  from '../../src/components/player/playerEventHandlers';
import Player from '../../src/components/player/index';

const manifestEditable = 'http://localhost:9876/base/tests/fixture-data/manifest.json';
const manifestAudio = 'http://localhost:9876/base/tests/fixture-data/manifest-audio.json';
const manifestQuicktime = 'http://localhost:9876/base/tests/fixture-data/manifest-mov.json';
const manifestWebm = 'http://localhost:9876/base/tests/fixture-data/manifest-webm.json';
const manifestM4v = 'http://localhost:9876/base/tests/fixture-data/manifest-m4v.json';
const manifestWmv = 'http://localhost:9876/base/tests/fixture-data/manifest-wmv.json';
const manifestEUscreen = 'http://localhost:9876/base/tests/fixture-data/manifest-euscreen.json';

describe('Player functions', () => {

  const appendFixture = (className, id) => {
    $(`.${className}`).remove();
    let markup = `<div class="${className}" ${id ? 'id="' + id + '"' : ''}></div>`;
    return $(markup).appendTo('body');
  };

  const elClass        =  'eups-player';
  const elWrapperClass =  'player-wrapper';

  const removeFixtures = (className, id) => {
    $(`.${elClass}`).remove();
    $(`.${elWrapperClass}`).remove();

  };

  const getPlayer = (manifestToUse, cbDone) => {
    const EuropeanaMediaPlayer = empIndex.default;

    let emp = new EuropeanaMediaPlayer(
      appendFixture(elWrapperClass),
      {manifest: manifestToUse},
      {mode: 'player', manifest: manifestToUse}
    );

    expect(emp.player).toBeTruthy();
    expect(emp.player.avcomponent).toBeTruthy();
    expect(document.querySelector(`.${elClass}`)).toBeTruthy();
    expect('.button-play').toBeTruthy();

    emp.player.avcomponent.on('mediaready', () => {
      cbDone(emp.player);
    });
  };

  const getSubtitlePlayer = (manifestToUse, cbDone) => {
    const EuropeanaMediaPlayer = empIndex.default;

    let emp = new EuropeanaMediaPlayer(
      appendFixture(elWrapperClass),
      {manifest: manifestToUse},
      {mode: 'player', manifest: manifestToUse}
    );

    expect(emp.player).toBeTruthy();
    expect(emp.player.avcomponent).toBeTruthy();
    expect(document.querySelector(`.${elClass}`)).toBeTruthy();
    expect('.button-play').toBeTruthy();

    emp.player.avcomponent.on('languagesinitialized', () => {
      cbDone(emp.player);
    });
  };

  beforeEach(() => {
    removeFixtures();
  });

  describe('player tests', () => {
    it('should not be constructed without an element', () => {
      const EuropeanaMediaPlayer = empIndex.default;
      let emp;
      try{
        emp = new EuropeanaMediaPlayer();
      }
      catch(e){}
      expect(emp).toBeFalsy();
    });

    it('should generate a unique player id', () => {
      let ids = {};
      let r = /^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/;
      for(var i=0; i<100; i++){
        let id = empIndex.uuidv4();
        ids[id] = true;
        expect(Object.keys(ids).length).toEqual(i + 1);
        expect(id.match(r)).toBeTruthy();
      }
    });
  });

  describe('DOM checks audio', () => {

    let player;

    beforeEach((done) => {
      getPlayer(manifestAudio, (innerPlayer) => {
        player = innerPlayer;
        done();
      });
    });

    it('should have an audio component', () => {
      expect($('audio').length).toBeTruthy();
      expect($('video').length).toBeFalsy();
    });
  });

  describe('DOM checks video', () => {

    let player;

    beforeEach((done) => {
      getPlayer(manifestEditable, (innerPlayer) => {
        player = innerPlayer;
        done();
      });
    });

    it('should have a duration', () => {
      const duration = document.querySelector('.canvas-duration');
      expect(duration.textContent).toMatch(/[0-9][0-9]:[0-9][0-9]/);
      const t = new Date(`1970-01-01T00:${duration.textContent}Z`);
      expect(t.getSeconds() | t.getMinutes()).toBeTruthy();
    });

    it('should show the more button / menu in editor mode', () => {

      // check button / menu added

      expect($('.moremenu').length).toBeFalsy();
      expect($('.btn[data-name=More').length).toBeFalsy();

      player.addEditorOption(player);

      expect($('.moremenu').length).toBeTruthy();
      expect($('.btn[data-name=More').length).toBeTruthy();

      // check button / menu work

      expect($('.moremenu').is(':visible')).toBeFalsy();
      $('.btn[data-name=More')[0].dispatchEvent(new Event('click'))
      expect($('.moremenu').is(':visible')).toBeTruthy();
    });

    it('should test if ended', () => {
      expect(player.hasEnded()).toBeFalsy();
    });

    it('plays on click', () => {
      expect($('.playwrapper').is(':visible')).toBeTruthy();
      $('.canvas-container').trigger('click');
      expect($('.playwrapper').is(':visible')).toBeFalsy();
    });

    it('should set the background', () => {
      const imgUrl = 'http://123.jpg';
      expect($('.canvas-container').attr('style')).not.toContain(imgUrl);
      player.setImage(player, imgUrl);
      expect($('.canvas-container').attr('style')).toContain(imgUrl);
    });

    it('should create a manifest', () => {
      const src  = 'EUS_'
      const prefix = 'https://videoeditor.noterik.com/manifest/euscreenmanifest.php?id=';
      player.createManifest({source: src});
      expect(player.manifesturl).toEqual(prefix + src);
    });

  });

  describe('Language Loading', () => {
    it('should (not yet) work with languages', () => {
      let player;
      let error = false;
      try{
        player = new Player(appendFixture('eups-player', 'eups-player-123')[0]);
        player.init({ manifest: manifestEditable }, manifestEditable, 'pl');
      }
      catch(e){
        error = true;
      }
      expect(error).toBeFalsy();
      // TODO: investigate why this reinitialisation is necessary to stop other tests failing
      player.init({ manifest: manifestEditable }, manifestEditable, '');
    });

  });

  describe('EUscreen manifest', () => {

    let player;

    beforeEach((done) => {
      getSubtitlePlayer(manifestEUscreen, (innerPlayer) => {
        player = innerPlayer;
        done();
      });
    });

    it('should have a video component', () => {
      expect($('video').length).toBeTruthy();
    });

    it('should have a subtitles button', () => {
      expect($('.btn[data-name=Subtitles').length).toBeTruthy();
    });

    it('should hold only the Dutch subtitles', () => {
      expect($('.subtitlemenu-option').length).toEqual(1);
      expect($('.subtitlemenu-option').attr('data-language')).toEqual("nl-NL");
    });

    it('should show and hide the subtitle list on clicks of the menu', () => {
      expect($('.subtitlemenu').is(':visible')).toBeFalsy();
      $('.btn[data-name=Subtitles')[0].dispatchEvent(new Event('click'));
      expect($('.subtitlemenu').is(':visible')).toBeTruthy();
      $('.btn[data-name=Subtitles')[0].dispatchEvent(new Event('click'));
      expect($('.subtitlemenu').is(':visible')).toBeFalsy();
    });

    it('should show and hide the subtitle list on key enter', () => {
      const getEnterKeyEvent = () => {
        return new KeyboardEvent('keypress',
          {
            altKey:false,
            bubbles: true,
            cancelBubble: false,
            cancelable: true,
            charCode: 0,
            code: 'Enter',
            composed: true,
            ctrlKey: false,
            currentTarget: null,
            defaultPrevented: true,
            detail: 0,
            eventPhase: 0,
            isComposing: false,
            isTrusted: true,
            key: 'Enter',
            keyCode: 13,
            location: 0,
            metaKey: false,
            repeat: false,
            returnValue: false,
            shiftKey: false,
            type: 'keypress',
            which: 13
          }
        );
      };
      expect($('.subtitlemenu').is(':visible')).toBeFalsy();
      $('.subtitlemenu-option')[0].dispatchEvent(getEnterKeyEvent());
      expect($('.subtitlemenu').is(':visible')).toBeTruthy();
    });

    it('should show the Dutch subtitles in the video on click of the menu item', () => {
      expect($('video')[0].textTracks[0].mode).toEqual('hidden');
      $('.subtitlemenu-option[data-language=nl-NL')[0].dispatchEvent(new Event('click'));
      expect($('video')[0].textTracks[0].mode).toEqual('showing');
    });
  });
});
