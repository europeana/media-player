/* global $ initCanvasNavigation */

import './index.scss';

require('@iiif/iiif-tree-component');
require('@iiif/base-component');
require('manifesto.js');
const Manifold = require('@iiif/manifold');
const IIIFAVComponent = require('@iiif/iiif-av-component');
require('dashjs');

require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/effects');

import Banana from 'banana-i18n';

const { playEventHandler, pauseEventHandler, volumeChangedEventHandler, keyEventHandler, playPauseEventHandler, fullScreenEventHandler, editorButtonEventHandler, toggleSubtitlesEventHandler, subtitleMenuEventHandler, openEditorTypeEventHandler, mediaErrorHandler } = require('./playerEventHandlers');

const { handleEUscreenItem } = require('./EUscreen');

const { handleTranscriptionAnnotations } = require('./transcriptionAnnotations');

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
    this.appendInlineFontStyle();
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

  appendInlineFontStyle() {
    const prependStyle = (fw, url) => {
      $('.eups-player').prepend(`<style>
        @font-face {
          font-family: 'Open Sans';
          font-style: normal;
          font-weight: ${fw};
          src: url(${url}) format('woff');
        }
        </style>`);
    };
    prependStyle(300, 'https://fonts.gstatic.com/s/opensans/v13/DXI1ORHCpsQm3Vp6mXoaTXhCUOGz7vYGh680lGh-uXM.woff');
    prependStyle(400, 'https://fonts.gstatic.com/s/opensans/v13/cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw.woff');
    prependStyle(600, 'https://fonts.gstatic.com/s/opensans/v13/MTP_ySUJH_bn48VBG8sNSnhCUOGz7vYGh680lGh-uXM.woff');
  }

  createAVComponent() {
    this.$avcomponent = $('<div class="iiif-av-component" tabindex="0"></div>');
    $(this.elem).append(this.$avcomponent);

    let player = this;

    this.avcomponent = new IIIFAVComponent.AVComponent({ target: this.$avcomponent[0] });

    this.avcomponent.on('mediaerror', (error) => {
      mediaErrorHandler(player, error);
    });

    this.avcomponent.on('log', (message) => {
      console.log(message);
    });

    this.avcomponent.on('play', () => {
      playEventHandler(player);
    });

    this.avcomponent.on('pause', () => {
      pauseEventHandler(player);
    });

    this.avcomponent.on('mediaready', () => {
      this.handleMediaReady(player);
    });

    this.avcomponent.on('fullscreen', (value) => {
      fullScreenEventHandler(player, value);
    });

    this.avcomponent.on('volumechanged', (value) => {
      volumeChangedEventHandler(player, value);
    });

    this.$avcomponent.on('keydown', (e) => {
      keyEventHandler(player, e);
    });
  }

  itemSelectListener(data) {
    if (this.handler === undefined) {
      this.handler = this;
    }

    this.handler.videoId = data;

    let player = this;

    this.handler.ldManifest(data, (helper) => {
      player.manifest = helper.manifest;

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
    let player = this;

    Manifold.loadManifest({
      manifestUri: manifest,
      collectionIndex: 0,
      manifestIndex: 0,
      sequenceIndex: 0,
      canvasIndex: 0
    }).then((h) => {
      helper = h;

      if (helper.manifest.__jsonld.items[0].items[0].items[0].body.id.indexOf('http://www.euscreen.eu/item.html?id=') > -1) {
        handleEUscreenItem(player, helper)
          .then((h) => {
            helper = h;
            player.setAvComponent(player, successcb);
          });
      } else {
        player.setAvComponent(player, successcb);
      }
    }).catch((e) => {
      errorcb(e);
    });
  }

  setAvComponent(player, successcb) {
    player.avcomponent.set({
      helper,
      limitToRange: player.state.limitToRange,
      autoSelectRange: player.state.autoSelectRange,
      constrainNavigationToRange: player.state.constrainNavigationToRange,
      virtualCanvasEnabled: player.state.virtualCanvasEnabled
    });
    successcb(helper);
    player.resize();
  }

  resize() {
    let $playerContainer = $('#'+this.elem.id+' .playerContainer');
    $playerContainer.height($playerContainer.width() * 0.75);
    this.avcomponent.resize();
  }

  createManifest(vObj) {
    if (!vObj.manifest && vObj.source.startsWith('EUS_')) {
      vObj.manifest = 'https://videoeditor.noterik.com/manifest/euscreenmanifest.php?id='+vObj.source;
    }

    this.manifesturl = vObj.manifest;
    this.itemSelectListener(vObj.manifest);
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
      toggleSubtitlesEventHandler(this, e);
    });

    let player = this;

    $('.subtitlemenu-option').on('click', (e) => {
      subtitleMenuEventHandler(player, e);
    });
    this.avcomponent.fire('languagesinitialized');
  }

  //todo: address audio as well
  hasEnded() {
    if ($('#'+this.elem.id+' video').length) {
      return $('#'+this.elem.id+' video')[0].ended;
    } else {
      return false;
    }
  }

  handleMediaReady(player) {
    this.updateAVComponentLanguage(player);

    let subtitles = this.createButton('Subtitles', this.banana.i18n('player-subtitles'), 'av-icon-subtitles');
    $('#'+player.elem.id+' .button-fullscreen').before(subtitles);

    if (player.editorurl && player.editorurl.length > 0) {
      let showMenu = player.needToShowMenu(player);

      if (showMenu) {
        this.addEditorOption(player);
      }
    }

    $('#'+player.elem.id+' .canvas-container').append('<div class=\'anno playwrapper\'><span class=\'playcircle\'></span></div>');

    this.handleMediaType(player);
    handleTranscriptionAnnotations(player);

    $('#'+player.elem.id+' .canvas-container').on('click', () => {
      playPauseEventHandler(player);
    });
  }

  addEditorOption(player) {
    let more = this.createButton('More', this.banana.i18n('player-more'), 'av-icon-more');
    more[0].addEventListener('click', (e) => {
      editorButtonEventHandler(player, e);
    });
    $('#'+player.elem.id+' .controls-container').append(more);

    this.handleMenuOptions(player);
  }

  updateAVComponentLanguage(player) {
    $('#'+player.elem.id+' .volume-mute').attr('title', player.banana.i18n('player-mute'));
    $('#'+player.elem.id+' .button-fullscreen').attr('title', player.banana.i18n('player-fullscreen'));
    $('#'+player.elem.id+' .button-play').attr('title', player.banana.i18n('player-play'));
  }

  createButton(name, text, classname) {
    let button = $('<button class="btn" data-name="'+name+'" title="'+text+'"><i class="av-icon '+classname+'" aria-hidden="true"></i>'+text+'</button>');
    return button;
  }

  handleMenuOptions(player) {
    $('#'+player.elem.id+' .canvas-container').append('<div class=\'anno moremenu\'></div>');

    let options = { embed: true, annotation: false, playlist: false, subtitles: false };
    options = player.determineOptionDisplay(player, options);

    for (let [key, value] of Object.entries(options)) {
      if (value) {
        $('#'+player.elem.id+' .moremenu').append('<div id=\'create-'+key+'-link\' class=\'moremenu-option\'>'+this.banana.i18n('player-create-'+key)+'</div>');

        $('#'+player.elem.id+' #create-'+key+'-link').on('click', (e) => {
          openEditorTypeEventHandler(player, e, key);
        });
      }
    }
  }

  needToShowMenu(player) {
    for (let [key, value] of Object.entries(player.manifest.__jsonld.rights)) {
      if (value === 'allowed' && (key === 'embed' || key === 'annotation' || key === 'playlist' || key === 'subtitles')) {
        return true;
      }
    }
    return false;
  }

  determineOptionDisplay(player, options) {
    for (let [key, value] of Object.entries(player.manifest.__jsonld.rights)) {
      if (value === 'allowed') {
        options[key] = true;
      }
    }
    return options;
  }

  handleMediaType(player) {
    let w, h;
    w = h = 400;
    switch (this.getMediaType(player)) {
      case 'Audio':
        this.setImage(player, player.manifest.__jsonld.thumbnail[0].id);
        break;
      case 'Video':
        w = player.avcomponent.canvasInstances[0]._canvasWidth;
        h = player.avcomponent.canvasInstances[0]._canvasHeight;
    }
    $('#'+player.elem.id).css({ width : w, height : h });
  }

  getMediaType(player) {
    return player.manifest.__jsonld.items[0].items[0].items[0].body.type;
  }

  setImage(player, image) {
    $('#'+player.elem.id+' .canvas-container').css({ 'background-image' : 'url(' + image +')' });
    $('#'+player.elem.id+' .canvas-container').addClass('audio-background');
  }
}
