import { DataSet, Timeline as visTimeline } from 'vis';
import 'vis/dist/vis-timeline-graph2d.min.css';
import * as css from './index.css'

var glue, timeline, currenttime;

export default class Timeline {
	constructor(elem) {
		if (!elem) return
		this.elem = elem
	}

	init(g) {
		console.log("applying glue to timeline");
		glue = g;

		glue.listen("player", "mediaready", this, this.mediareadyListener);
		glue.listen("player", "timeupdate", this, this.timeUpdate);
		glue.listen("annotationeditor", "addannotation", this, this.addAnnotation);
		glue.listen("annotationeditor", "updateannotation", this, this.updateAnnotation);
		glue.listen("annotationeditor", "deleteannotation", this, this.deleteAnnotation);
		glue.listen("annotationeditor", "selectannotation", this, this.selectAnnotation);
		glue.listen("annotationeditor", "deselectannotation", this, this.deselectAnnotation);
	}

	createTimeline(duration) {
		if ($('#vis-timeline').length) {
			$('#vis-timeline').remove();
		}

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
		}

		//TODO: display annotations from IIIF
		let timelinedata = new DataSet([]);
		//let timelinedata = new DataSet([{ id: 1, content: 'Annotation', start: 60000, end: 90000 }, {id: 2, content: 'The entire timeline', start: 0, end: 120000}]);

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

		glue.signal("timeline", "loaded", null);
	}

	mediareadyListener(data) {
		this.handler.createTimeline(data);
	}

	timeUpdate(data) {
		let time = data * 1000;
		timeline.setCustomTime(time, currenttime);
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

	IIIFAnnotationsToVisJS() {

	}
}