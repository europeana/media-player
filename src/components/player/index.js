import * as css from './index.css'

require("@iiif/base-component");
require("@iiif/iiif-av-component");
require("@iiif/iiif-tree-component");
require("manifesto.js");
require("@iiif/manifold");
require("dashjs");

require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/effects');

var helper, avcomponent;

export default class Player {
  constructor(elem) {
    if (!elem) return
    this.elem = elem;

    this.videoId = "";
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

    avcomponent = this.avcomponent = new IIIFComponents.AVComponent({
      target: this.$avcomponent[0]
    });

    this.avcomponent.on("mediaerror", function(error) {
      
      $("#"+that.elem.id+" .player").removeClass("player--loading");
      let errormessage = "Error: ";
      switch (error.code) {
        case 1:
          errormessage += "loading aborted";
        break;
        case 2: 
          errormessage += "network error";
        break;
        case 3:
          errormessage += "decoding of media failed";
        break;
        case 4:
            errormessage += "media format not suppported by this browser";
        break;
        default: 
          errormessage += "unknown";
        break;
      }

      $("#"+that.elem.id+" .canvas-container").append("<div class='anno errormessage'>"+errormessage+"</div>")
    });

    this.avcomponent.on("log", function (message) {
      console.log(message);
    });
    this.avcomponent.on("canvasready", function () {
      if (this.canvasready) return;

      this.canvasready = true;
    });
    this.avcomponent.on("play", function () {
      $("#"+that.elem.id+" .playwrapper").hide();
    });

    this.avcomponent.on("pause", function () {
      clearInterval(that.timeupdate);
    });

    this.avcomponent.on("rangechanged", function() {
      console.log("range changed");
    });

    this.avcomponent.on("mediaready", function () {
      let subtitles = $('<button class="btn" title="Subtitles"><i class="av-icon av-icon-subtitles" aria-hidden="true"</i>Subtitles</button>');
      $("#"+that.elem.id+" .controls-container").append(subtitles);

      if (that.editorurl && that.editorurl.length > 0) {
        let more = $('<button class="btn" title="More"><i class="av-icon av-icon-more" aria-hidden="true"></i>More</button>');
        more[0].addEventListener('click', (e) => {
          e.preventDefault();

          if ($("#"+that.elem.id+" .moremenu").is(":visible")) {
            $("#"+that.elem.id+" .moremenu").hide();
          } else {
            $("#"+that.elem.id+" .moremenu").css({bottom: $("#"+that.elem.id+" .options-container").height(), left: (($('#'+that.elem.id+' .btn[title="More"]').offset().left - $('#'+that.elem.id+' .player').offset().left) - ($("#"+that.elem.id+" .moremenu").width() / 2))});
            $("#"+that.elem.id+" .moremenu").show();
          }       
        });
        $("#"+that.elem.id+" .controls-container").append(more);

        $("#"+that.elem.id+" .canvas-container").append("<div class='anno moremenu'><div id='create-embed-link' class='moremenu-option'>Create embed</div><div id='create-annotations-link' class='moremenu-option'>Create annotations</div><div id='create-playlist-link' class='moremenu-option'>Create playlist</div><div id='create-subtitles-link' class='moremenu-option'>Create subtitles</div></div>");

        $("#create-annotations-link").on('click', function() {
          window.open(that.editorurl+"#annotation?manifest="+encodeURIComponent(that.manifesturl), "_blank");
        });

        $("#create-embed-link").on('click', function() {
          window.open(that.editorurl+"#embed?manifest="+encodeURIComponent(that.manifesturl), "_blank");
        });
      }

      $("#"+that.elem.id+" .canvas-container").append("<div class='anno playwrapper'><span class='playcircle'></span></div>");

      $("#"+that.elem.id+" .playcircle").on("click", function() {
        $("#"+that.elem.id+" .playwrapper").hide();
        that.avcomponent.canvasInstances[0].play();
      }); 

      $("#"+that.elem.id).css({width: that.avcomponent.canvasInstances[0]._canvasWidth, height: that.avcomponent.canvasInstances[0]._canvasHeight});
    });

    this.avcomponent.on("fullscreen", function () {
      $("#"+that.elem.id+" .moremenu").hide();
    });
  }

  itemSelectListener(data) {
    if (this.handler === undefined) {
      this.handler = this;
    }

    this.handler.videoId = data;

    var that = this;

    this.handler.loadManifest(data, function (helper) {
      that.manifest = helper.manifest;
      console.log("SUCCESS: Manifest data loaded.", helper.manifest);
      var canvases = helper.getCanvases();
      if (canvases.length > 1) {
        initCanvasNavigation(canvases);
      } else {
        $(".canvasNavigationContainer").hide();
      }
    }, function (error) {
      console.error("ERROR: Could not load manifest data.", error);
    });
  }
  
  loadManifest(manifest, successcb, errorcb) {
    var that = this;

    Manifold.loadManifest({
      iiifResourceUri: manifest,
      collectionIndex: 0,
      manifestIndex: 0,
      sequenceIndex: 0,
      canvasIndex: 0
    }).then(function (h) {
      helper = h;

      that.avcomponent.set({
        helper: helper,
        limitToRange: that.state.limitToRange,
        autoSelectRange: that.state.autoSelectRange,
        constrainNavigationToRange: that.state.constrainNavigationToRange,
        virtualCanvasEnabled: that.state.virtualCanvasEnabled
      });
      successcb(helper);
      that.resize();
    }).catch(function (e) {
      errorcb(e);
    });
  }

  resize() {
    var $playerContainer = $("#"+this.elem.id+" .playerContainer");
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
    } else if (vObj.source.endsWith(".json") || vObj.source.includes("/manifest/")) {
      manifest = vObj.source;
    } else if (vObj.source.startsWith("EUS_")) {
        manifest = "https://videoeditor.noterik.com/manifest/euscreenmanifest.php?id="+vObj.source;      
    } else {
        manifest = "https://videoeditor.noterik.com/manifest/createmanifest.php?src="+vObj.source+"&duration="+vObj.duration+"&id="+vObj.id;

      if (vObj.width) {
        manifest += "&width="+vObj.width;
      } 
      if (vObj.height) {
        manifest += "&height="+vObj.height;
      }
      if (vObj.mediatype) {
        manifest += "&mediatype="+vObj.mediatype;
      }
    }
    this.manifesturl = manifest;
    this.itemSelectListener(manifest);
  }
}