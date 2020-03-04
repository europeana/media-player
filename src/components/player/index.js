/* global $ Manifold IIIFComponents initCanvasNavigation */

import './index.css';

require('@iiif/base-component');
require('@iiif/iiif-tree-component');
require('@iiif/iiif-av-component');
require('manifesto.js');
require('@iiif/manifold');
require('dashjs');

require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/effects');

import Banana from 'banana-i18n';

const { handleKeyEvents, handlePlayPauseEvent, handleFullScreenEvent, handleEditorButtonEvent, toggleSubtitlesEvent, handleSubtitleMenuEvent, openEditorTypeEvent } = require('./playerEvents');

const languages = require('../languages/lang.js').default.locales;
const i18n = require('./i18n/languages.json');

let helper;

export default class Player {
  constructor(elem) {
    if (!elem) return;
    this.elem = elem;

    this.videoId = '';
    this.avcomponent;
    this.timeupdate;
    this.manifest;
    this.manifesturl;
    this.editorurl;
    this.banana;
  }

  init(videoObj, editorurl, language) {
    this.createAVComponent();
    this.createManifest(videoObj);
    this.editorurl = editorurl;

    this.state = {
      limitToRange: false,
      autoSelectRange: true,
      constrainNavigationToRange: true,
      virtualCanvasEnabled: true
    };

    //Check if the language is set, and if we have this present, otherwise default to English
    if (language.length === 0 || languages.find(lang => lang.code === language) === undefined) {
      language = 'en';
    }

    const banana = new Banana(language);
    banana.load(i18n[language], language);
    this.banana = banana;
  }

  createAVComponent() {
    this.$avcomponent = $('<div class="iiif-av-component" tabindex="0"></div>');
    $(this.elem).append(this.$avcomponent);

    let player = this;

    this.avcomponent = new IIIFComponents.AVComponent({ target: this.$avcomponent[0] });

    this.avcomponent.on('mediaerror', (error) => {
      this.handleMediaError(player, error);
    });

    this.avcomponent.on('log', (message) => {
      console.log(message);
    });

    this.avcomponent.on('play', () => {
      $('#'+player.elem.id+' .playwrapper').hide();
      $('#'+player.elem.id+' .button-play').attr('title', player.banana.i18n('player-pause'));
    });

    this.avcomponent.on('pause', () => {
      clearInterval(player.timeupdate);
      $('#'+player.elem.id+' .button-play').attr('title', player.banana.i18n('player-play'));
    });

    this.avcomponent.on('mediaready', () => {
      this.handleMediaReady(player);
    });

    this.avcomponent.on('fullscreen', () => {
      handleFullScreenEvent(player);
    });

    this.avcomponent.on('volumechanged', (value) => {
      let muteType = value !== 0 ? 'player-mute' : 'player-unmute';
      $('#'+player.elem.id+' .volume-mute').attr('title', player.banana.i18n(muteType));
    });

    this.$avcomponent.on('keydown', (e) => {
      handleKeyEvents(player, e);
    });
  }

  itemSelectListener(data) {
    if (this.handler === undefined) {
      this.handler = this;
    }

    this.handler.videoId = data;

    let that = this;

    this.handler.ldManifest(data, (helper) => {
      that.manifest = helper.manifest;

      let canvases = helper.getCanvases();
      if (canvases.length > 1) {
        initCanvasNavigation(canvases);
      } else {
        $('.canvasNavigationContainer').hide();
      }
    }, (error) => {
      console.error('ERROR: Could not load manifest data.', error);
    });
  }

  ldManifest(manifest, successcb, errorcb) {
    let that = this;

    Manifold.loadManifest({
      iiifResourceUri: manifest,
      collectionIndex: 0,
      manifestIndex: 0,
      sequenceIndex: 0,
      canvasIndex: 0
    }).then((h) => {
      helper = h;

      that.avcomponent.set({
        helper,
        limitToRange: that.state.limitToRange,
        autoSelectRange: that.state.autoSelectRange,
        constrainNavigationToRange: that.state.constrainNavigationToRange,
        virtualCanvasEnabled: that.state.virtualCanvasEnabled
      });
      successcb(helper);
      that.resize();
    }).catch((e) => {
      errorcb(e);
    });
  }

  resize() {
    let $playerContainer = $('#'+this.elem.id+' .playerContainer');
    $playerContainer.height($playerContainer.width() * 0.75);
    this.avcomponent.resize();
  }

  createManifest(vObj) {
    let manifest;

    if (vObj.manifest) {
      manifest = vObj.manifest;
    } else if (vObj.source.startsWith('EUS_')) {
      manifest = 'https://videoeditor.noterik.com/manifest/euscreenmanifest.php?id='+vObj.source;
    }

    this.manifesturl = manifest;
    this.itemSelectListener(manifest);
  }

  initLanguages() {
    let textTracks = $('#'+this.elem.id+' video')[0].textTracks;

    //check if we have any texttracks
    if (textTracks.length === 0) {
      return;
    }

    //show button only if we have at least one language set
    $('.btn[data-name=Subtitles]').show();

    let menu = '<div class=\'anno subtitlemenu\'>';
    for (let i = 0; i < textTracks.length; i++) {
      menu += '<div class=\'subtitlemenu-option\' data-language=\''+textTracks[i].language+'\'>'+languages.find(lang => lang.iso === textTracks[i].language).name+'</div>';
    }
    menu += '</div>';

    $('#'+this.elem.id+' .canvas-container').append(menu);

    $('button[data-name="Subtitles"]')[0].addEventListener('click', (e) => {
      toggleSubtitlesEvent(this, e);
    });

    let that = this;

    $('.subtitlemenu-option').on('click', function(e) {
      handleSubtitleMenuEvent(that, e);
    });
  }

  //todo: address audio as well
  hasEnded() {
    if ($('#'+this.elem.id+' video').length) {
      return $('#'+this.elem.id+' video')[0].ended;
    } else {
      return false;
    }
  }

  handleMediaError(that, error) {
    console.error('media error', error);

    $('#'+that.elem.id+' .player').removeClass('player--loading');
    let errormessage = this.banana.i18n('player-error')+': ';
    switch (error.code) {
      case 1:
        errormessage += this.banana.i18n('player-error-loading');
        break;
      case 2:
        errormessage += this.banana.i18n('player-error-network');
        break;
      case 3:
        errormessage += this.banana.i18n('player-error-decoding');
        break;
      case 4:
        errormessage += this.banana.i18n('player-error-format');
        break;
      default:
        errormessage += this.banana.i18n('player-error-unknown');
        break;
    }

    $('#'+that.elem.id+' .canvas-container').append('<div class=\'anno errormessage\'>'+errormessage+'</div>');
  }

  handleMediaReady(that) {
    if (that.avcomponent.canvasInstances[0]._canvasWidth < 400) {
      this.optimizeForSmallerScreens();
    }

    this.updateAVComponentLanguage(that);

    let subtitles = this.createButton('Subtitles', this.banana.i18n('player-subtitles'), 'av-icon-subtitles');
    $('#'+that.elem.id+' .controls-container').append(subtitles);

    if (that.editorurl && that.editorurl.length > 0) {
      let showMenu = that.needToShowMenu(that);

      if (showMenu) {
        this.addEditorOption(that);
      }
    }

    $('#'+that.elem.id+' .canvas-container').append('<div class=\'anno playwrapper\'><span class=\'playcircle\'></span></div>');

    $('#'+that.elem.id).css({ width: that.avcomponent.canvasInstances[0]._canvasWidth, height: that.avcomponent.canvasInstances[0]._canvasHeight });

    $('#'+that.elem.id+' .canvas-container').on('click', () => {
      handlePlayPauseEvent(that);
    });
  }

  optimizeForSmallerScreens() {
    $('.iiif-av-component .controls-container .volume').css({ 'width': 80 });
    $('.iiif-av-component .controls-container .volume .volume-slider').css({ 'width': 42 });
  }

  addEditorOption(that) {
    let more = this.createButton('More', this.banana.i18n('player-more'), 'av-icon-more');
    more[0].addEventListener('click', (e) => {
      handleEditorButtonEvent(that, e);
    });
    $('#'+that.elem.id+' .controls-container').append(more);

    this.handleMenuOptions(that);
  }

  updateAVComponentLanguage(that) {
    $('#'+that.elem.id+' .volume-mute').attr('title', that.banana.i18n('player-mute'));
    $('#'+that.elem.id+' .button-fullscreen').attr('title', that.banana.i18n('player-fullscreen'));
    $('#'+that.elem.id+' .button-play').attr('title', that.banana.i18n('player-play'));
  }

  createButton(name, text, classname) {
    let button = $('<button class="btn" data-name="'+name+'" title="'+text+'"><i class="av-icon '+classname+'" aria-hidden="true"></i>'+text+'</button>');
    return button;
  }

  handleMenuOptions(that) {
    $('#'+that.elem.id+' .canvas-container').append('<div class=\'anno moremenu\'></div>');

    let options = { embed: true, annotation: false, playlist: false, subtitles: false };
    options = that.determineOptionDisplay(that, options);
    
    for (let [key, value] of Object.entries(options)) {
      if (value) {
        $('#'+that.elem.id+' .moremenu').append('<div id=\'create-'+key+'-link\' class=\'moremenu-option\'>'+this.banana.i18n('player-create-'+key)+'</div>');

        $('#create-'+key+'-link').on('click', (e) => {
          openEditorTypeEvent(that, e, key);
        });
      }
    }
  }

  needToShowMenu(that) {
    for (let [key, value] of Object.entries(that.manifest.__jsonld.rights)) {
      if (value === 'allowed' && (key === 'embed' || key === 'annotation' || key === 'playlist' || key === 'subtitles')) {
        return true;
      }
    }
    return false;
  }

  determineOptionDisplay(that, options) {
    for (let [key, value] of Object.entries(that.manifest.__jsonld.rights)) {
      if (value === 'allowed') {
        options[key] = true;
      }
    }
    return options;
  }
}