import * as css from './index.css'

var glue;

export default class AnnotationEditor {
	constructor(elem) {
		if (!elem) return
		this.elem = elem;
		this.mediaduration = 0;
		this.annotations = [];
		this.mediaready = false;
	}
	
	init(g) {
		glue = g;

		glue.listen("player", "mediaready", this, this.mediareadyListener);
		glue.listen("player", "timeupdate", this, this.timeUpdate);
		glue.listen("timeline", "timeupdate", this, this.timeUpdate);
		glue.listen("annotationviewer", "timeupdate", this, this.timeUpdate);
		glue.listen("timeline", "selectitem", this, this.selectItem);
		glue.listen("timeline", "click", this, this.deselectAnnotation);
		glue.listen("timeline", "loaded", this, this.timelineLoaded);
		glue.listen("main", "loadannotations", this, this.loadAnnotations);
		glue.listen("annotationviewer", "edit", this, this.editClickedListener);
	}
	
	mediareadyListener(data) {
		this.handler.mediaready = true;
		this.handler.mediaduration = data;
	}

	editClickedListener(data) {
		if (!this.handler.mediaready) {
			return;
		}

		if (this.handler.elem) {
			this.handler.elem.innerHTML = `
			<form id="annotation-form">
			<div id="annotationtype-wrapper" class="annotation-element">
				<select id="annotationtype" required>
					<option selected value="" disabled>Add annotation type</option>
					<option value="note">Note</option>
				</select>
			</div>
			<div id="annotationlist-wrapper" class="annotation-element">
				<select id="annotationlist" disabled>
					<option value="0">Select an annotation</option>
					<!--TODO: load existing annotations from IIIF AV manifest -->
				</select>
			</div>
			<div id="annotationtext-wrapper" class="annotation-element">
				<span id="annotationtypedisplay"><i class="fas fa-sticky-note"></i> Note</span>
				<i id="deleteannotation" class="fa fa-trash rightelement pointer" aria-hidden="true"></i><br/>
				<textarea id="annotationtext" required placeholder="Enter your annotation here" maxlength="60"></textarea>
			</div>
			<div id="annotationtiming-wrapper" class="annotation-element">
				Timing<br/>
				<i id="stepbackward" class="fas fa-step-backward leftelement pointer"></i>
				<input type="text" id="annotationtiming-start" class="annotationtiming-element" value="00:00.000" pattern="((?:2[0-3]|[01]?[0-9]):)?[0-5][0-9]:[0-5][0-9].[0-9]{3}">
				<span class="fa fa-stack leftelement"><i id="startup" class="fas fa-sort-up pointer"></i><i id="startdown" class="fas fa-sort-down pointer"></i></span>
				<i id="stepforward" class="fas fa-step-forward rightelement pointer"></i>
				<span class="fa fa-stack rightelement"><i id="endup" class="fas fa-sort-up pointer"></i><i id="enddown" class="fas fa-sort-down pointer"></i></span>
				<input type="text" id="annotationtiming-end" class="annotationtiming-element" value="00:10.000" pattern="((?:2[0-3]|[01]?[0-9]):)?[0-5][0-9]:[0-5][0-9].[0-9]{3}">
			</div>
			<div id="annotationsave-wrapper" class="annotation-element">
				<div id="annotationsave-button">Save</div>
			</div>
			<button id="annotationsave-submit" type="submit">submit</button>
			</form>
		`;
		}

		let that = this.handler;

		//load stored annotations
		if (this.handler.annotations.length > 0) {
			this.handler.updateAnnotationList(this.handler);
		}

		$("#annotationsave-button").click(function() {
			var annotationForm = $('#annotation-form');
			//check if form has all required and validated time input
			if(! annotationForm[0].checkValidity()) {
				// If the form is invalid, submit it. The form won't actually submit;
				// this will just cause the browser to display the native HTML5 error messages.
				annotationForm.find(':submit').click();
				return;
			}

			//check if start & endtime do exist, otherwise correct
			let endTime = that.deformatTime($("#annotationtiming-end").val()) > that.mediaduration ? that.mediaduration : that.deformatTime($("#annotationtiming-end").val());
			$("#annotationtiming-end").val(that.formatTime(endTime));
			let startTime = that.deformatTime($("#annotationtiming-start").val());
			startTime = that.validateStartTime(startTime);	
			$("#annotationtiming-start").val(that.formatTime(startTime));

			var currentid = parseInt($("#annotationlist").find("option:selected").attr("value"));

			let annotation = {};
			annotation.text = $("#annotationtext").val();
			annotation.start = startTime;
			annotation.end = endTime;
			annotation.type = $("#annotationtype").val();
			annotation.id = currentid != 0 ? currentid : Math.floor(100000000 + Math.random() * 900000000);

			if (currentid != 0) {
				that.annotations[that.annotations.findIndex(a => a.id === annotation.id)] = annotation;
			} else {
				that.annotations.push(annotation);
			}
			that.updateAnnotationList(that);
			
			if (currentid != 0) {
				glue.signal("annotationeditor", "updateannotation", annotation);
			} else {
				glue.signal("annotationeditor", "addannotation", annotation);
			}
			//deselect to allow new annotation to be added
			that.deselectAnnotation();
		});

		$("#annotationlist").change(function() {
			var id = parseInt($("#annotationlist").find("option:selected").attr("value"));
			//update type
			$("#annotationtype").val(that.annotations.find(a => a.id === id).type);
			$("#annotationtype").trigger("change");
			//update text
			$("#annotationtext").val(that.annotations.find(a => a.id === id).text);
			//update timing
			$("#annotationtiming-start").val(that.formatTime(that.annotations.find(a => a.id === id).start));
			$("#annotationtiming-end").val(that.formatTime(that.annotations.find(a => a.id === id).end));
			//display delete icon
			$("#deleteannotation").show();
			//select in timeline
			glue.signal("annotationeditor", "selectannotation", that.annotations.find(a => a.id === id));
		});

		$("#annotationtype").change(function() {
			var type = $("#annotationtype").find("option:selected").attr("value");
			
			$("#annotationtypedisplay").show();
		});

		$("#stepbackward").click(function() { $("#annotationtiming-start").val(that.formatTime(0)) });
		$("#stepforward").click(function() { $("#annotationtiming-end").val(that.formatTime(that.mediaduration)) });
		$("#startup").mousedown(function() { that.starttimeChange(500); });
		$("#startdown").mousedown(function() { that.starttimeChange(-500); });
		$("#endup").mousedown(function() { that.endtimeChange(500);	});
		$("#enddown").mousedown(function() { that.endtimeChange(-500); });

		$("#deleteannotation").click(function() {
			//get id of annotation to delete
			var id = parseInt($("#annotationlist").find("option:selected").attr("value"));
			//signal delete of annotation
			glue.signal("annotationeditor", "deleteannotation", that.annotations.find(a => a.id === id));

			that.annotations.splice(that.annotations.findIndex(a => a.id === id), 1);

			//update ui
			that.deselectAnnotation();
			that.updateAnnotationList(that);
		});
	}

	timeUpdate(data) {
		//update annotation time boxes, take boundaries into account
		let time = data * 1000 < 0 ? 0 : data * 1000;
		time = time > this.handler.mediaduration ? this.handler.mediaduration : time;
		let endtime = time + 10000 > this.handler.mediaduration ? this.handler.mediaduration : time + 10000;
		$("#annotationtiming-start").val(this.handler.formatTime(time));
		$("#annotationtiming-end").val(this.handler.formatTime(endtime));
	}

	selectItem(data) {
		if (this.handler.annotations.find(a => a.id === data)) {
			$("#annotationlist").val(data);
			$("#annotationlist").trigger("change");
		} else {
			this.handler.deselectAnnotation();
		}	
	}

	deselectAnnotation(handler) {
		//update type
		$("#annotationtype").val("");
		//update select annotation list
		$("#annotationlist").val("0");
		//update text
		$("#annotationtext").val("");
		//don't show annotation type as this is not yet defined
		$("#annotationtypedisplay").hide();
		//don't display delete icon
		$("#deleteannotation").hide();

		glue.signal("annotationeditor", "deselectannotation", null);
	}

	updateAnnotationList(that) {		
		//update annotation list
		let annotationselect = $("#annotationlist");
		annotationselect.empty();
		if (Object.keys(that.annotations).length == 0) {
			annotationselect.attr("disabled", "disabled");
		} else {
			annotationselect.removeAttr("disabled");
		}
		
		annotationselect.append($("<option></option>").attr("value", 0).text("Select an annotation"));
		
		//order annotations based on their starttime
		that.annotations.sort((a,b) => a.start - b.start);

		Object.keys(that.annotations).forEach(function(key, index) {
			annotationselect.append($("<option></option>").attr("value", that.annotations[key].id).text(that.annotations[key].text +" ["+that.formatTime(that.annotations[key].start)+"]"));
		});
	}

	starttimeChange(time) {
		//update annotation time boxes, take boundaries into account
		let newTime = this.deformatTime($("#annotationtiming-start").val()) + time < 0 ? 0 : this.deformatTime($("#annotationtiming-start").val()) + time;
		newTime = this.validateStartTime(newTime);
		$("#annotationtiming-start").val(this.formatTime(newTime));
	}

	endtimeChange(time) {
		//update annotation time boxes, take boundaries into account
		let newTime = this.deformatTime($("#annotationtiming-end").val()) + time > this.mediaduration ? this.mediaduration : this.deformatTime($("#annotationtiming-end").val()) + time;
		newTime = this.validateEndTime(newTime);
		$("#annotationtiming-end").val(this.formatTime(newTime));
	}	

	validateStartTime(newTime) {
		newTime = newTime > this.mediaduration ? this.mediaduration : newTime;
		//also make sure endtime is at least equal or bigger then the starttime
		if (this.deformatTime($("#annotationtiming-end").val()) < newTime) {
			newTime = this.deformatTime($("#annotationtiming-end").val());
		}
		return newTime;
	}

	validateEndTime(newTime) {
		newTime = newTime < 0 ? 0 : newTime;
		//also make sure starttime is at most equal or lower then the endtime
		if (this.deformatTime($("#annotationtiming-start").val()) > newTime) {
			newTime = this.deformatTime($("#annotationtiming-start").val());
		}
		return newTime;
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

	deformatTime(time) {
		let parts = time.split(":");

		parts = parts.length > 3 ? parts.slice(parts.length-3) : parts; 
		for (let i = parts.length; i < 3; i++) {
			parts.unshift(0);
		}

		let hours = parseInt(parts[0]);
		let minutes = parseInt(parts[1]);
		let secmsparts = parts[2].split(".");
		let seconds = parseInt(secmsparts[0]);
		let milliseconds = parseInt(secmsparts[1]);

		return (hours*3600 + minutes*60 + seconds) * 1000 + milliseconds;
	}

	getAnnotations() {
		return this.annotations;
	}

	loadAnnotations(data) {
		this.handler.annotations = data;
	}

	timelineLoaded(data) {
		if (this.handler.annotations.length > 0) {
			this.handler.annotations.forEach(function(annotation) {
				glue.signal("annotationeditor", "addannotation", annotation);
			});
		}
	}
}