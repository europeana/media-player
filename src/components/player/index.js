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

    let that = this;

    this.avcomponent = new IIIFComponents.AVComponent({ target: this.$avcomponent[0] });

    this.avcomponent.on('mediaerror', (error) => {
      this.handleMediaError(that, error);
    });

    this.avcomponent.on('log', (message) => {
      console.log(message);
    });

    this.avcomponent.on('play', () => {
      $('#'+that.elem.id+' .playwrapper').hide();
      $('#'+that.elem.id+' .button-play').attr('title', that.banana.i18n('player-pause'));
    });

    this.avcomponent.on('pause', () => {
      clearInterval(that.timeupdate);
      $('#'+that.elem.id+' .button-play').attr('title', that.banana.i18n('player-play'));
    });

    this.avcomponent.on('mediaready', () => {
      this.handleMediaReady(that);
    });

    this.avcomponent.on('fullscreen', () => {
      this.handleFullScreen(that);
    });

    this.avcomponent.on('volumechanged', (value) => {
      let muteType = value !== 0 ? 'player-mute' : 'player-unmute';
      $('#'+that.elem.id+' .volume-mute').attr('title', that.banana.i18n(muteType));
    });

    this.$avcomponent.on('keydown', (e) => {
      if (e.keyCode === 32 || e.keyCode === 75) {  //space bar, k button
        that.handlePlayPause(that);
      }
      if (e.keyCode === 70) { //f button
        $('#'+that.elem.id+' .button-fullscreen').click();
      }
      if (e.keyCode === 38) { //volume up by 10%
        let val = $('#'+that.elem.id+' .volume-slider').slider('option', 'value');
        val = val > 0.9 ? 1 : val + 0.1;
        $('#'+that.elem.id+' .volume-slider').slider('value', val);
      }
      if (e.keyCode === 40) { //volume down by 10%
        let val = $('#'+that.elem.id+' .volume-slider').slider('option', 'value');
        val = val < 0.1 ? 0 : val - 0.1;
        $('#'+that.elem.id+' .volume-slider').slider('value', val);
      }
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
    let textTracks = $('video')[0].textTracks;

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
      this.toggleSubtitles(e);
    });

    let that = this;

    $('.subtitlemenu-option').on('click', function(e) {
      this.handleSubtitleMenu(that, e);
    });
  }

  //todo: address correct object with class / id
  //todo: address audio as well
  hasEnded() {
    if ($('video').length) {
      return $('video')[0].ended;
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
      let showMenu = false;
      for (let [key, value] of Object.entries(that.manifest.__jsonld.rights)) {
        if (value === 'allowed' && (key === 'embed' || key === 'annotation' || key === 'playlist' || key === 'subtitles')) {
          showMenu = true;
          break;
        }
      }
      if (showMenu) {
        this.addEditorOption(that);
      }
    }

    $('#'+that.elem.id+' .canvas-container').append('<div class=\'anno playwrapper\'><span class=\'playcircle\'></span></div>');

    $('#'+that.elem.id).css({ width: that.avcomponent.canvasInstances[0]._canvasWidth, height: that.avcomponent.canvasInstances[0]._canvasHeight });

    $('#'+that.elem.id+' .canvas-container').on('click', () => {
      this.handlePlayPause(that);
    });
  }

  handleFullScreen(that) {
    $('#'+that.elem.id+' .moremenu').hide();
    $('#'+that.elem.id+' .subtitlemenu').hide();
  }

  toggleSubtitles(e) {
    e.preventDefault();

    if ($('#'+this.elem.id+' .subtitlemenu').is(':visible')) {
      $('#'+this.elem.id+' .subtitlemenu').hide();
    } else {
      $('#'+this.elem.id+' .subtitlemenu').css({ bottom: $('#'+this.elem.id+' .options-container').height(), left: (($('#'+this.elem.id+' .btn[data-name="Subtitles"]').offset().left - $('#'+this.elem.id+' .player').offset().left) - ($('#'+this.elem.id+' .subtitlemenu').width() / 2)) });
      $('#'+this.elem.id+' .subtitlemenu').show();
    }
  }

  handleSubtitleMenu(that, e) {
    $('#'+that.elem.id+' .subtitlemenu').hide();
    let textTracks = $('video')[0].textTracks;

    for (let i = 0; i < textTracks.length; i++) {
      if ($(this).data('language') === textTracks[i].language) {
        textTracks[i].mode = 'showing';
      } else {
        textTracks[i].mode = 'hidden';
      }
    }
    //prevent the play/pause handler to react
    e.stopPropagation();
  }

  openEditorType(that, event, type) {
    //prevent the play/pause handler to react
    event.stopPropagation();

    window.open(that.editorurl+'?manifest='+encodeURIComponent(that.manifesturl)+'#'+type, '_blank');
  }

  optimizeForSmallerScreens() {
    $('.iiif-av-component .controls-container .volume').css({ 'width': 80 });
    $('.iiif-av-component .controls-container .volume .volume-slider').css({ 'width': 42 });
  }

  addEditorOption(that) {
    let more = this.createButton('More', this.banana.i18n('player-more'), 'av-icon-more');
    more[0].addEventListener('click', (e) => {
      this.handleEditorButton(e, that);
    });
    $('#'+that.elem.id+' .controls-container').append(more);

    let embed, annotation, playlist, subtitles = false;

    for (let [key, value] of Object.entries(that.manifest.__jsonld.rights)) {
      if (key === 'embed' && value === 'allowed') {
        embed = true;
      } else if (key === 'annotation' && value === 'allowed') {
        annotation = true;
      } else if (key === 'playlist' && value === 'allowed') {
        playlist = true;
      } else if (key === 'subtitles' && value === 'allowed') {
        subtitles = true;
      }
    }

    $('#'+that.elem.id+' .canvas-container').append('<div class=\'anno moremenu\'></div>');

    if (embed) {
      $('#'+that.elem.id+' .moremenu').append('<div id=\'create-embed-link\' class=\'moremenu-option\'>'+this.banana.i18n('player-create-embed')+'</div>');
    }
    if (annotation) {
      $('#'+that.elem.id+' .moremenu').append('<div id=\'create-annotations-link\' class=\'moremenu-option\'>'+this.banana.i18n('player-create-annotations')+'</div>');
    }
    if (playlist) {
      $('#'+that.elem.id+' .moremenu').append('<div id=\'create-playlist-link\' class=\'moremenu-option\'>'+this.banana.i18n('player-create-playlist')+'</div>');
    }
    if (subtitles) {
      $('#'+that.elem.id+' .moremenu').append('<div id=\'create-subtitles-link\' class=\'moremenu-option\'>'+this.banana.i18n('player-create-subtitles')+'</div>');
    }

    $('#create-annotations-link').on('click', (e) => {
      this.openEditorType(that, e, 'annotation');
    });

    $('#create-embed-link').on('click', (e) => {
      this.openEditorType(that, e, 'embed');
    });

    $('#create-playlist-link').on('click', (e) => {
      this.openEditorType(that, e, 'playlist');
    });

    $('#create-subtitles-link').on('click', (e) => {
      this.openEditorType(that, e, 'subtitles');
    });
  }

  handleEditorButton(e, that) {
    e.preventDefault();

    if ($('#'+that.elem.id+' .moremenu').is(':visible')) {
      $('#'+that.elem.id+' .moremenu').hide();
    } else {
      $('#'+that.elem.id+' .moremenu').css({ bottom: $('#'+that.elem.id+' .options-container').height(), left: (($('#'+that.elem.id+' .btn[data-name="More"]').offset().left - $('#'+that.elem.id+' .player').offset().left) - ($('#'+that.elem.id+' .moremenu').width() / 2)) });
      $('#'+that.elem.id+' .moremenu').show();
    }
  }

  handlePlayPause(that) {
    if (that.avcomponent.canvasInstances[0].isPlaying()) {
      that.avcomponent.canvasInstances[0].pause();
    } else {
      //hide playcircle if showing
      if ($('#'+that.elem.id+' .playwrapper').is(':visible')) {
        $('#'+that.elem.id+' .playwrapper').hide();
      }
      that.avcomponent.canvasInstances[0].play();
    }
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
}
