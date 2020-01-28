/* global $ Manifold IIIFComponents initCanvasNavigation */

import './index.css';

require('@iiif/base-component');
require('@iiif/iiif-av-component');
require('@iiif/iiif-tree-component');
require('manifesto.js');
require('@iiif/manifold');
require('dashjs');

require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/effects');

const languages = require('../languages/lang.js').default.locales;

let helper, avcomponent;

export default class Player {
  constructor(elem) {
    if (!elem) return;
    this.elem = elem;

    this.videoId = '';
    this.canvasready = false;
    this.avcomponent;
    this.timeupdate;
    this.manifest;
    this.manifesturl;
    this.editorurl;
    this.mode;
  }

  init(videoObj, editorurl) {
    this.render();
    this.createManifest(videoObj);
    this.editorurl = editorurl;

    this.state = {
      limitToRange: false,
      autoSelectRange: true,
      constrainNavigationToRange: true,
      virtualCanvasEnabled: true
    };
  }

  render() {
    this.createAVComponent();
  }

  createAVComponent() {
    this.$avcomponent = $('<div class="iiif-av-component"></div>');
    $(this.elem).append(this.$avcomponent);

    let that = this;

    avcomponent = this.avcomponent = new IIIFComponents.AVComponent({ target: this.$avcomponent[0] });

    this.avcomponent.on('mediaerror', (error) => {
      this.handleMediaError(that, error);
    });

    this.avcomponent.on('log', (message) => {
      console.log(message);
    });
    this.avcomponent.on('canvasready', function() {
      if (this.canvasready) return;
      this.canvasready = true;
    });
    this.avcomponent.on('play', () => {
      $('#'+that.elem.id+' .playwrapper').hide();
    });

    this.avcomponent.on('pause', () => {
      clearInterval(that.timeupdate);
    });

    this.avcomponent.on('mediaready', () => {
      this.handleMediaReady(that);
    });

    this.avcomponent.on('fullscreen', () => {
      this.handleFullScreen(that);
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

  //time update from other components
  timeupdatefunction(data) {
    avcomponent.setCurrentTime(data);
  }

  getVideoId() {
    return this.videoId;
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

  //todo: address correct object with class / id
  initLanguages() {
    let textTracks = $('video')[0].textTracks;

    //check if we have any texttracks
    if (textTracks.length === 0) {
      return;
    }

    //show button only if we have at least one language set
    $('.btn[title=Subtitles]').show();

    let menu = '<div class=\'anno subtitlemenu\'>';
    for (let i = 0; i < textTracks.length; i++) {
      menu += '<div class=\'subtitlemenu-option\' data-language=\''+textTracks[i].language+'\'>'+languages.find(lang => lang.iso === textTracks[i].language).name+'</div>';
    }
    menu += '</div>';

    $('#'+this.elem.id+' .canvas-container').append(menu);

    $('button[title="Subtitles"]')[0].addEventListener('click', (e) => {
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
    let errormessage = 'Error: ';
    switch (error.code) {
      case 1:
        errormessage += 'loading aborted';
        break;
      case 2:
        errormessage += 'network error';
        break;
      case 3:
        errormessage += 'decoding of media failed';
        break;
      case 4:
        errormessage += 'media format not suppported by this browser';
        break;
      default:
        errormessage += 'unknown';
        break;
    }

    $('#'+that.elem.id+' .canvas-container').append('<div class=\'anno errormessage\'>'+errormessage+'</div>');
  }

  handleMediaReady(that) {
    if (that.avcomponent.canvasInstances[0]._canvasWidth < 400) {
      this.optimizeForSmallerScreens();
    }

    let subtitles = $('<button class="btn" title="Subtitles"><i class="av-icon av-icon-subtitles" aria-hidden="true"</i>Subtitles</button>');
    $('#'+that.elem.id+' .controls-container').append(subtitles);

    if (that.editorurl && that.editorurl.length > 0) {
      this.addEditorOption(that);
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
      $('#'+this.elem.id+' .subtitlemenu').css({ bottom: $('#'+this.elem.id+' .options-container').height(), left: (($('#'+this.elem.id+' .btn[title="Subtitles"]').offset().left - $('#'+this.elem.id+' .player').offset().left) - ($('#'+this.elem.id+' .subtitlemenu').width() / 2)) });
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

    window.open(that.editorurl+'#'+type+'?manifest='+encodeURIComponent(that.manifesturl), '_blank');
  }

  optimizeForSmallerScreens() {
    $('.iiif-av-component .controls-container .volume').css({ 'width': 80 });
    $('.iiif-av-component .controls-container .volume .volume-slider').css({ 'width': 42 });
  }

  addEditorOption(that) {
    let more = $('<button class="btn" title="More"><i class="av-icon av-icon-more" aria-hidden="true"></i>More</button>');
    more[0].addEventListener('click', (e) => {
      this.handleEditorButton(e, that);
    });
    $('#'+that.elem.id+' .controls-container').append(more);

    $('#'+that.elem.id+' .canvas-container').append('<div class=\'anno moremenu\'><div id=\'create-embed-link\' class=\'moremenu-option\'>Create embed</div><div id=\'create-annotations-link\' class=\'moremenu-option\'>Create annotations</div><div id=\'create-playlist-link\' class=\'moremenu-option\'>Create playlist</div><div id=\'create-subtitles-link\' class=\'moremenu-option\'>Create subtitles</div></div>');

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
      $('#'+that.elem.id+' .moremenu').css({ bottom: $('#'+that.elem.id+' .options-container').height(), left: (($('#'+that.elem.id+' .btn[title="More"]').offset().left - $('#'+that.elem.id+' .player').offset().left) - ($('#'+that.elem.id+' .moremenu').width() / 2)) });
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
}
