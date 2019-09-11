import * as css from './index.css'

require("@iiif/base-component");
require("@iiif/iiif-av-component");
require("@iiif/iiif-tree-component");
require("manifesto.js");
require("@iiif/manifold");
require("dashjs");

require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/effects');

var helper, avcomponent, glue;

export default class Player {
  constructor(elem) {
    if (!elem) return
    this.elem = elem;
    this.videoId = "";
    this.canvasready = false;
    this.avcomponent;
    this.timeupdate;
    this.manifest;
    this.editorurl;
    this.mode;
    this.eupsid;

    this.state = {
      limitToRange: false,
      autoSelectRange: true,
      constrainNavigationToRange: true,
      virtualCanvasEnabled: true
    };
  }

  init(g, videoObj, editorurl, mode, eupsid) {
    glue = g;

    this.render();
    this.createManifest(videoObj);
    this.editorurl = editorurl;
    this.mode =  mode;
    this.eupsid = eupsid;

    glue.listen("timeline", "timeupdate", this, this.timeupdatefunction);
    glue.listen("annotationviewer", "timeupdate", this, this.timeupdatefunction);
  }

  render() {
    this.createAVComponent();
  }

  createAVComponent() {
    this.$avcomponent = $('<div id="iiif-av-component" class="iiif-av-component"></div>');
    $(this.elem).append(this.$avcomponent);

    let that = this;

    avcomponent = this.avcomponent = new IIIFComponents.AVComponent({
      target: this.$avcomponent[0]
    });

    this.avcomponent.on("mediaerror", function(error) {
      $(".player").removeClass("player--loading");
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

      $(".canvas-container").append("<div class='anno errormessage'>"+errormessage+"</div>")
    });

    this.avcomponent.on("log", function (message) {
      console.log(message);
    });
    this.avcomponent.on("canvasready", function () {
      if (this.canvasready) return;

      this.canvasready = true;
    });
    this.avcomponent.on("play", function () {
      $(".playwrapper").hide();
      that.timeupdate = setInterval(() => glue.signal("player", "timeupdate", that.avcomponent.getCurrentTime()), 25);
    });

    this.avcomponent.on("pause", function () {
      clearInterval(that.timeupdate);
    });

    this.avcomponent.on("rangechanged", function() {
      console.log("range changed");
    });

    this.avcomponent.on("mediaready", function () {
      let subtitles = $('<button class="btn" title="Subtitles"><i class="av-icon av-icon-subtitles" aria-hidden="true"</i>Subtitles</button>');
      $(".controls-container").append(subtitles);

      let more = $('<button class="btn" title="More"><i class="av-icon av-icon-more" aria-hidden="true"></i>More</button>');
      more[0].addEventListener('click', (e) => {
        e.preventDefault();

        if ($(".moremenu").is(":visible")) {
          $(".moremenu").hide();
        } else {
          $(".moremenu").css({bottom: $(".options-container").height(), left: (($('.btn[title="More"]').offset().left - $('.player').offset().left) - ($(".moremenu").width() / 2))});
          $(".moremenu").show();
        }       
        //glue.signal("player", "moreclicked", null);
      });
      $(".controls-container").append(more);

      $(".canvas-container").append("<div class='anno playwrapper'><span class='playcircle'></span></div>");
      $(".canvas-container").append("<div class='anno moremenu'><div id='create-embed-link' class='moremenu-option'>Create embed</div><div id='create-annotations-link' class='moremenu-option'>Create annotations</div></div>");

      $("#create-annotations-link").on('click', function() {
        window.open(that.editorurl+"?mode=editor&manifest="+encodeURIComponent(that.manifest)+"&eupsid="+that.eupsId, "_blank");
      });

      $(".playcircle").on("click", function() {
        $(".playwrapper").hide();
        that.avcomponent.canvasInstances[0].play();
      }); 

      $("#eups-content-wrapper").css({width: that.avcomponent.canvasInstances[0]._canvasWidth, height: that.avcomponent.canvasInstances[0]._canvasHeight});

      //currently only way to retrieve duration from the canvasinstances
      glue.signal("player", "mediaready", that.deformatTimeToMs(that.avcomponent.canvasInstances[0]._$canvasDuration[0].innerText));

      //attach slide listener
      $(that.avcomponent.canvasInstances[0]._$canvasTimelineContainer).on("slide", function(event, ui) {
        glue.signal("player", "timeupdate", ui.value);
      });
    });

    this.avcomponent.on("fullscreen", function () {
      $(".moremenu").hide();
    });

    var $ppc = $("#play-pause-combo");

    this.avcomponent.on("medialoaded", function () {
      $ppc.text("play");
      $ppc.removeAttr("disabled");
    });
    $ppc.on("click", function (e) {
      e.preventDefault();
      if (this.avcomponent._isPlaying) {
        this.avcomponent.pause();
        $ppc.innerText("play");
      } else {
        this.avcomponent.play();
        $ppc.innerText("pause");
      }
    });
  }

  itemSelectListener(data) {
    if (this.handler === undefined) {
      this.handler = this;
    }

    glue.signal("player", "manifest", data);

    this.handler.videoId = data;

    this.handler.loadManifest(data, function (helper) {
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
    var $playerContainer = $(".playerContainer");
    $playerContainer.height($playerContainer.width() * 0.75);
    this.avcomponent.resize();
  }

  //time update from other components
  timeupdatefunction(data) {
    avcomponent.setCurrentTime(data);
  }

  deformatTimeToMs(time) {
		let parts = time.split(":");

		parts = parts.length > 3 ? parts.slice(parts.length-3) : parts; 
		for (let i = parts.length; i < 3; i++) {
			parts.unshift(0);
		}

		let hours = parseInt(parts[0]);
		let minutes = parseInt(parts[1]);
		let seconds = parseInt(parts[2]);

		return (hours*3600 + minutes*60 + seconds) * 1000;
  }
  
  getVideoId() {
    return this.videoId;
  }

  createManifest(vObj) {
    let manifest;
    
    if (vObj.source.endsWith(".json") || vObj.source.includes("/manifest/")) {
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
    this.manifest = manifest;
    this.itemSelectListener(manifest);
  }
}