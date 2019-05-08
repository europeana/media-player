import * as css from './index.css'

require("@iiif/base-component");
require("@iiif/iiif-av-component");
require("@iiif/iiif-tree-component");
require("@iiif/manifold");

require('jqueryui');

var helper, avcomponent, glue;

export default class Player {
  constructor(elem) {
    if (!elem) return
    this.elem = elem
    this.canvasready = false;
    this.avcomponent;
    this.timeupdate;

    this.state = {
      limitToRange: false,
      autoSelectRange: true,
      constrainNavigationToRange: true,
      virtualCanvasEnabled: true
    };
  }

  init(g) {
    console.log("applying glue to player");
    glue = g;
    this.render();
    glue.listen("timeline", "timeupdate", this, this.timeupdatefunction);
  }

  render() {
    console.debug("render player");
    this.createAVComponent();
  }

  createAVComponent() {
    console.debug("Create AV component");
    this.$avcomponent = $('<div id="iiif-av-component" class="iiif-av-component"></div>');
    $(this.elem).append(this.$avcomponent);

    let that = this;

    avcomponent = this.avcomponent = new IIIFComponents.AVComponent({
      target: this.$avcomponent[0]
    });

    this.avcomponent.on("log", function (message) {
      //console.log(message);
    });
    this.avcomponent.on("canvasready", function () {
      if (this.canvasready) return;

      this.canvasready = true;
    });
    this.avcomponent.on("play", function () {
      that.timeupdate = setInterval(() => glue.signal("player", "timeupdate", that.avcomponent.getCurrentTime()), 25);
    });

    this.avcomponent.on("pause", function () {
      clearInterval(that.timeupdate);
    });

    this.avcomponent.on("rangechanged", function() {
      console.log("range changed");
    });

    this.avcomponent.on("mediaready", function () {
      //currently only way to retrieve duration from the canvasinstances
      glue.signal("player", "mediaready", that.deformatTimeToMs(that.avcomponent.canvasInstances[0]._$canvasDuration[0].innerText));

      //attach slide listener
      $(that.avcomponent.canvasInstances[0]._$canvasTimelineContainer).on("slide", function(event, ui) {
        glue.signal("player", "timeupdate", ui.value);
      });
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

    glue.listen("testItem", "clicked", this, this.itemSelectListener);
  }

  itemSelectListener(data) {
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
      that.helper = h;

      that.avcomponent.set({
        helper: that.helper,
        limitToRange: that.state.limitToRange,
        autoSelectRange: that.state.autoSelectRange,
        constrainNavigationToRange: that.state.constrainNavigationToRange,
        virtualCanvasEnabled: that.state.virtualCanvasEnabled
      });
      successcb(that.helper);
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
}