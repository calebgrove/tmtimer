// @codekit-prepend "fittext", "global";

//-----------------
//-----------------
// UI STALKING
//-----------------
//-----------------

// set values inside custom timer fields from predefined options.
var radioOptions = document.querySelectorAll("#predefined input");

function setCustomValues(){
	function getCheckedValue(radioObj) {
		if(!radioObj)
			return "";
		var radioLength = radioObj.length;
		if(radioLength === undefined)
			if(radioObj.checked)
				return radioObj.value;
			else
				return "";
		for(var i = 0; i < radioLength; i++) {
			if(radioObj[i].checked) {
				return radioObj[i].value;
			}
		}
		return "";
	}
	
	function doSetCustomValues(a,b,c,d) {
		customGreenLight.value = a;
		customYellowLight.value = b;
		customRedLight.value = c;
		customDq.value = d;
		
		// revalidate them all
		validateAll(customArray);
	}
	
	if (getCheckedValue(radioOptions) === "tableTopics"){
		doSetCustomValues("1:00", "1:30", "2:00", "2:30");
	} else if (getCheckedValue(radioOptions) === "evaluation"){
		doSetCustomValues("2:00", "2:30", "3:00", "3:30");
	} else if (getCheckedValue(radioOptions) === "icebreaker"){
		doSetCustomValues("4:00", "5:00", "6:00", "6:30");
	} else if (getCheckedValue(radioOptions) === "speech"){
		doSetCustomValues("5:00", "6:00", "7:00", "7:30");
	}
}

for(var i=0; i<radioOptions.length; i++){
	radioOptions[i].onclick = setCustomValues;
}

// watch start button
controlButton.onclick = function(){ startTimer() };

//  watch the space bar
onSpaceKey(startTimer);

//-----------------
//-----------------
// FIRE UP THEM ENGINES, 'CAUSE HERE WE GO! :P
//-----------------
//-----------------

function startTimer(){

	// If the clock is already running, instead of starting, stop the timer.
	if (currentTime != 0) {
		//console.log("Reset not complete");
		stopTimer();
		return false;
	}
	
	// check that the values are valid, otherwise, kill and alert.
	var invalidArray = [];
	var readableArray = [];
	for(i=0; i<customArray.length; i++){
		if (validate(customArray[i], RegExp(/^[0-9]{1,2}:[0-5]{1}[0-9]{1}$/)) === false) {
			invalidArray.push(customArray[i]);
		}
	}
	
	// if there is an entry in the invalid array, we need to build the alert.
	if(invalidArray.length > 0){
		
		// okay, let's build the alert
		invalidArray.map(function(arrayCell){
			if(arrayCell.id === "customGreenLight"){
				readableArray.push("green light");
			} else if(arrayCell.id === "customYellowLight"){
				readableArray.push("yellow light");
			} else if(arrayCell.id === "customRedLight"){
				readableArray.push("red light");
			} else if (arrayCell.id === "customDq"){
				readableArray.push("disqualification");
			}
		}); 
		
		// build the error messages, send them, and kill the function via return()
		if(readableArray.length === 1){
			var alertMessage = "Whoops, the " + readableArray[0] + " value does not look like it is formatted correctly. There are two accepted formats: \nMM:SS (example: 14:00) \nM:SS (example: 4:15) \nPlease correct it, and try again."
			return(alert(alertMessage));
		} else if(readableArray.length === 2){
			var alertMessage = "Whoops, the " + readableArray[0] + " and " + readableArray[1] + " values do not look like they are formatted correctly. There are two accepted formats: \nMM:SS (example: 14:00) \nM:SS (example: 4:15) \nPlease correct them, and try again."
			return(alert(alertMessage));
		} else if(readableArray.length === 3){
			var alertMessage = "Whoops, the " + readableArray[0] + "," + readableArray[1] + " and " + readableArray[2] + " values do not look like they are formatted correctly. There are two accepted formats: \nMM:SS (example: 14:00) \nM:SS (example: 4:15) \nPlease correct them, and try again."
			return(alert(alertMessage));
		} else if(readableArray.length === 3){
			var alertMessage = "Whoops, none of the time values look like they are formatted correctly. There are two accepted formats: \nMM:SS (example: 14:00) \nM:SS (example: 4:15) \nPlease correct them, and try again."
			return(alert(alertMessage));
		} else {
			var alertMessage = "Whoops, it looks like your formatted at least one of the time formats incorrectly. There are two accepted formats: \nMM:SS (example: 14:00) \nM:SS (example: 4:15) \nPlease correct them, and try again."
			return(alert(alertMessage));
		}
	}
	
	// let's grab the times from the input fields
	minTime = timeToMs(customGreenLight.value);
	midTime = timeToMs(customYellowLight.value);
	maxTime = timeToMs(customRedLight.value);
	dqTime = timeToMs(customDq.value);
	
	// now that we are running, time to change the ui a bit
	controlButton.innerHTML = "Stop";
	controlButton.onclick = stopTimer;

	//  watch the space bar
	onSpaceKey(stopTimer);

	// hide controls
	hideControls();
	
	// begin growing the chrono bar
	growerAnimation = TweenLite.to(grower, dqTime / 1000, {css:{width:"100%"}});
	
	// tick tock, start the clock
	clockElement.innerHTML = (msToTime(0));
	clockIntervalId = setInterval(reportTime, 1000);

	// log it to analytics
	gtag('event', 'Timer Start');

	// log it to console
	//console.log('timer started');
}

//-----------------
//-----------------
// KILL IT ALL!
//-----------------
//-----------------

function stopTimer(){
	
	// ui changes
	controlButton.innerHTML = "Resume";
	controlButton.onclick = resumeTimer;

	// watch the space bar
	onSpaceKey(resetTimer);
	
	// stop the background color changer
	window.clearTimeout(minColorTimeoutId);
	window.clearTimeout(midColorTimeoutId);
	window.clearTimeout(maxColorTimeoutId);
	window.clearTimeout(fullColorTimeoutId);
	clearInterval(pulsateIntervalId);
	
	// stop the chrono bar
	growerAnimation.pause();
	
	// stop the clock
	clearInterval(clockIntervalId);

	// show reset button
	TweenLite.to(resetButton, 0.5, { css: {
		transform: 'translate(0)',
	}});

	// watch the reset button
	resetButton.onclick = function(){ resetTimer() };

	// log it to analytics
	gtag('event', 'Timer Stop');

	// log it to console
	//console.log('timer stopped');
}

//-----------------
//-----------------
// RESUME THE TIMER
//-----------------
//-----------------

function resumeTimer(){

	// set control button to stop timer
	controlButton.innerHTML = "Stop";
	controlButton.onclick = stopTimer;

	// hide reset button
	TweenLite.to(resetButton, 0.5, { css: {
		transform: 'translate(-2000px)',
	}});

	//  watch the space bar
	onSpaceKey(stopTimer);

	// resume grower
	growerAnimation.resume();

	// resume clock
	clockIntervalId = setInterval(reportTime, 1000);

	// log it to console
	//console.log('timer resumed');
}

//-----------------
//-----------------
// RESET THE TIMER
//-----------------
//-----------------

function resetTimer(){

	// change to a start button
	controlButton.innerHTML = "Start";
	controlButton.onclick = startTimer;

	// set clock to 00:00
	currentTime = 0;
	clockElement.innerHTML = (msToTime(currentTime));

	// reset background color
	colorChange(defaultColor);

	// set grower bar to 0
	growerAnimation.seek(0);

	// show controls
	showControls();

	//  watch the space bar
	onSpaceKey(startTimer);

	// hide reset button
	TweenLite.to(resetButton, 0.5, { css: {
		transform: 'translate(-2000px)',
	}});

	// log it to console
	//console.log('timer reset');
}

//-----------------
//-----------------
// VALIDATION
//-----------------
//-----------------
	
// we need these to be global to the function
var timeout;

// 1 second after the last keystroke, validate the active field.
function validateWatch(toWatch){
	if(timeout) {
		clearTimeout(timeout);
		timeout = null;
	}	
	timeout = setTimeout(function(){ validateThis(toWatch) }, 1000);
}

var validateThis = function(toValidate){
	if (/^[0-9]{1,2}:[0-5]{1}[0-9]{1}$/.test(toValidate.value) === true){
		toValidate.className = "valid";
	} else {
		toValidate.className = "invalid";
	}
}

var validateAll = function(array){
	for(i=0; i<array.length; i++) {
		validateThis(array[i]);			
	}
}