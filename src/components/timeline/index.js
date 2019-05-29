import { DataSet, Timeline as visTimeline } from 'vis';
import 'vis/dist/vis-timeline-graph2d.min.css';
import * as css from './index.css'

var glue, timeline, currenttime;

export default class Timeline {
	constructor(elem) {
		if (!elem) return
		this.elem = elem;
		this.mediaduration = 0;
		this.mediaready = false;
	}

	init(g) {
		glue = g;

		glue.listen("player", "mediaready", this, this.mediareadyListener);
		glue.listen("player", "timeupdate", this, this.timeUpdate);
		glue.listen("annotationviewer", "timeupdate", this, this.timeUpdate);
		glue.listen("annotationeditor", "addannotation", this, this.addAnnotation);
		glue.listen("annotationeditor", "annotationload", this, this.addAnnotation);
		glue.listen("annotationeditor", "updateannotation", this, this.updateAnnotation);
		glue.listen("annotationeditor", "deleteannotation", this, this.deleteAnnotation);
		glue.listen("annotationeditor", "selectannotation", this, this.selectAnnotation);
		glue.listen("annotationeditor", "deselectannotation", this, this.deselectAnnotation);
		glue.listen("annotationviewer", "edit", this, this.editClickedListener);
	}

	createTimeline(duration) {
		if ($('#vis-timeline').length) {
			$('#vis-timeline').remove();
		}

		$(this.elem).append(`<div class="loading-icon"><div></div><div></div><div></div><div></div></div>`);

		this.$timeline = $('<div id="vis-timeline"></div>');
		$(this.elem).append(this.$timeline);

		var options = {
			format: {
				minorLabels: {
					millisecond: 'mm:ss.SSS',
					second: 'mm:ss',
					minute: 'mm:ss',
					hour: 'HH:mm',
					weekday: 'HH:mm', 
					day: 'HH:mm',
					month: 'HH:mm',
					year: 'HH:mm',
				},
				majorLabels: function (date, scale, step) {
					return "";
				}
			},
			min: 0,
			max: duration,
			onInitialDrawComplete: this.hideLoading,
			editable: {
				add: true,         // add new items by double tapping
				updateTime: true,  // drag items horizontally
				updateGroup: false, // drag items from one group to another
				remove: false,       // delete an item by tapping the delete button top right
				overrideItems: false  // allow these options to override item.editable
			  }
		}

		//TODO: display annotations from IIIF
		let timelinedata = new DataSet([]);

		timeline = new visTimeline(this.$timeline[0], timelinedata, options);

		currenttime = timeline.addCustomTime(0, "currenttime");
		//don't display time as alternative text
		timeline.setCustomTimeTitle("", "currenttime");
		
		//listen to timechange event on custom time bar
		timeline.on("timechange", function(properties) {
			if (properties.id == "currenttime") {
				glue.signal("timeline", "timeupdate", (properties.time).getTime() / 1000);
			}
		});
		timeline.on("select", function(properties) {
			//signal when a single item is selected
			if (properties.items.length == 1) {
				glue.signal("timeline", "selectitem", properties.items[0]);
			}
		});

		timeline.on("click", function(properties) {
			//signal when no item was clicked
			if (properties.item === null) {
				glue.signal("timeline", "click", "");
			}
		});

		timelinedata.on("update", function(event, properties) {
			glue.signal("timeline", "itemupdate", {id: properties.data[0].id, start: properties.data[0].start, end: properties.data[0].end});
		});

		glue.signal("timeline", "loaded", null);
	}

	mediareadyListener(data) {
		this.handler.mediaready = true;
		this.handler.mediaduration = data;		
	}

	editClickedListener(data) {
		if (!this.handler.mediaready) {
			return;
		}

		this.handler.createTimeline(this.handler.mediaduration);
	}

	timeUpdate(data) {
		let time = data * 1000;
		if (timeline !== undefined) {
			timeline.setCustomTime(time, currenttime);
		}
	}

	addAnnotation(annotation) {
		timeline.itemsData.add([{id: annotation.id, content: annotation.text, start: annotation.start, end: annotation.end}]);
	}

	updateAnnotation(annotation) {
		let update = {id: annotation.id, content: annotation.text, start: annotation.start, end: annotation.end};
		timeline.itemsData.update([update]);
	}

	deleteAnnotation(annotation) {
		timeline.itemsData.remove(annotation.id);
	}

	selectAnnotation(annotation) {
		timeline.setSelection(annotation.id);
	}

	deselectAnnotation(annotation) {
		timeline.setSelection([]);
	}

	hideLoading() {
		$("#eups-timeline > .loading-icon").hide();
	}

	IIIFAnnotationsToVisJS() {

	}
}