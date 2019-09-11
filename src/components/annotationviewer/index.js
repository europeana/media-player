import * as css from './index.css'

var glue;
var editorurl;

export default class AnnotationViewer {
	constructor(elem, ) {
		if (!elem) return
		this.elem = elem;
		this.mediaduration = 0;
		this.annotations = [];
		this.mediaready = false;
		this.manifest;
		this.eupsId;
	}
	
	init(g, e) {
		glue = g;
		editorurl = e;
		glue.listen("player", "manifest", this, this.manifestHandler);
        glue.listen("player", "mediaready", this, this.mediareadyListener);
        //glue.listen("player", "moreclicked", this, this.moreClickedListener);
		glue.listen("main", "loadannotations", this, this.loadAnnotations);
		glue.listen("main", "eupsId", this, this.getEupsId);		
    }

    mediareadyListener(data) {
		this.handler.mediaready = true;
		this.handler.mediaduration = data;
	}

	moreClickedListener(data) {
		if (!this.handler.mediaready) {
			return;
		}

		if (this.handler.elem) {
            this.handler.elem.innerHTML = `<div id="annotationviewer-header">
            <span id="annotationviewer-edit-icon"><i class="far fa-edit pointer"></i></span>
            </div>
            <div id="annotationviewer-content">
            </div>
            `;

            var that = this;
            $("#annotationviewer-edit-icon").on('click', function() {
				if (editorurl !== undefined) {
					console.log("opening external editor");
					window.open(editorurl+"?mode=editor&manifest="+encodeURIComponent(that.handler.manifest)+"&eupsid="+that.handler.eupsId, "_blank");
				} else {		
					console.log("Showing internal editor");
					$(that.handler.elem).hide();
					glue.signal("annotationviewer", "edit", null);
				}
            });

            this.handler.showAnnotations();
        }
    }

    loadAnnotations(data) {
			this.handler.annotations = data;
    }
    
    showAnnotations() {
        if (this.annotations.length > 0) {
            //order annotations based on their starttime
		    	this.annotations.sort((a,b) => a.start - b.start);

            var that = this;

		    Object.keys(this.annotations).forEach(function(key, index) {
                $("#annotationviewer-content").append(`<div id="annotationviewer-content-id_${that.annotations[key].id}" class="annotationviewer-content-item">
                <div class="annotationviewer-timing-info pointer" data-start="${that.annotations[key].start}">${that.formatTime(that.annotations[key].start)} - ${that.formatTime(that.annotations[key].end)} </div>
                <div class="annotationviewer-text pointer" data-start="${that.annotations[key].start}">${that.annotations[key].text}</div></div>`);
				});
				
				$(".annotationviewer-timing-info,.annotationviewer-text").on('click', function() {
						let starttime = $(this).data("start") / 1000;
						glue.signal("annotationviewer", "timeupdate", starttime);
				});
			} else {
				$("#annotationviewer-content").append(`No annotations yet added`);
			}
    }

    formatTime(time) {
		let hours = Math.floor(time / 3600000);
		let minutes = Math.floor(time / 60000);
		let seconds = Math.floor((time % 60000) / 1000);
		let milliseconds = time % 1000;

		let timestring = hours > 0 ? hours+":" : "";
		timestring += minutes < 10 ? "0"+minutes+":" : minutes+":";
		timestring += seconds < 10 ? "0"+seconds+"." : seconds+".";
		if (milliseconds < 10) {
			timestring += "00"+milliseconds;
		} else if (milliseconds < 100) {
			timestring += "0"+milliseconds;
		} else {
			timestring += milliseconds;
		}
		return timestring;
	}

	getEupsId(data) {
		this.handler.eupsId = data;
	}

	manifestHandler(data) {
		this.handler.manifest = data;
	}
}