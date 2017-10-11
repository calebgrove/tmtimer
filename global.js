//-----------------
//-----------------
// GLOBAL VARIABLES
//-----------------
//-----------------

var customArray = [
	document.getElementById('customGreenLight'),
	document.getElementById('customYellowLight'),
	document.getElementById('customRedLight'),
	document.getElementById('customDq')
];

var bgElement         = document.getElementById('wrapper'),
	grower            = document.getElementById('grower'),
	clockElement      = document.getElementById('clock'),
	controlButton     = document.getElementById('controlButton'),
	clockWrapper      = document.getElementById('clockWrapper'),
	customGreenLight  = customArray[0],
	customYellowLight = customArray[1],
	customRedLight    = customArray[2],
	customDq          = customArray[3];

var clockIntervalId    = undefined,
	minColorTimeoutId  = undefined,
	midColorTimeoutId  = undefined,
	maxColorTimeoutId  = undefined,
	fullColorTimeoutId = undefined,
	pulsateIntervalId  = undefined,
	currentTime        = undefined;

var minTime = undefined,
	midTime = undefined,
	maxTime = undefined,
	dqTime  = undefined,
	growerAnimation = undefined;

var defaultColor = 'hsl(0, 0%, 70%)',    // gray
	minColor     = 'hsl(119, 59%, 52%)', // green
	midColor     = 'hsl(51, 78%, 57%)',  // yellow
	maxColor     = 'hsl(353, 76%, 58%)'; // red

TweenLite.defaultEase = Linear.easeNone;
var currentTime = 0;

//-----------------
//-----------------
// GLOBAL FUNCTIONS
//-----------------
//-----------------


//-----------------
// time conversions
//-----------------

function sec(seconds){ return seconds * 1000; }

function min(minutes){ return minutes * 60000; }

function timeToMs(timeString){
	timeString = timeString.split(':');
	var minutesAsMs = min(timeString[0]).toPrecision();
	var secondsAsMs = sec(timeString[1]).toPrecision();
	return(Number(minutesAsMs) + Number(secondsAsMs));
}

function msToTime(duration){
	var seconds = parseInt((duration/1000)%60);
	var minutes = parseInt((duration/(1000*60))%60);
	var hours = parseInt((duration/(1000*60*60))%24);

	minutes = (minutes < 10) ? '0' + minutes : minutes;
	seconds = (seconds < 10) ? '0' + seconds : seconds;

	return minutes + '<span class="colon">:</span>' + seconds;
}

//-----------------
// useful tools
//-----------------

function validate(toValidate, regex) {
	if (regex.test(toValidate.value) === true){
		return true;
	} else {
		return false;
	}

}

//-----------------
// timing core
//-----------------

function colorChange(color){ bgElement.style.backgroundColor = color; }

function reportTime(){
	
	// add another second
	currentTime += 1000;
	clockElement.innerHTML = (msToTime(currentTime));
	
	// change the background colors
	if(currentTime < minTime){
		colorChange(defaultColor);
	} else if(currentTime === minTime){
		colorChange(minColor);
	} else if(currentTime === midTime){
		colorChange(midColor);
	} else if(currentTime === maxTime){
		colorChange(maxColor);
	} else if(currentTime === dqTime){
		var toggle = true;
		var pulse = function(){
			if(toggle === true){
				colorChange(defaultColor);
				toggle = false;
			} else {
				colorChange(maxColor);
				toggle = true;
			}
		}
		pulsateIntervalId = setInterval(pulse, 300);
	}
}

//-----------------
// ui
//-----------------

function hideControls() {
	var elToHide = document.getElementById('hideAway');
	TweenLite.to(elToHide, 0.5, {css: {
		transform: 'translateY(-2000px)',
		opacity:'0',
		maxHeight:'0'
	}});
	TweenLite.to(clockElement, 0.2, {css:{paddingLeft:'0'}, delay:0.5});
	controlButton.className += ' timerRunning'
}

function showControls() {
	var elToShow = document.getElementById('hideAway');
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
	console.log(w);
	if(w > 570){
		// we only want the clock to slide 300px to the right if we are at a large viewport
		var fullClockAnimation = TweenLite.to(clockElement, 0.2, {css:{paddingLeft:'300px'}});
	} else {
		wrapper.style.bottom = "auto";
	}
	TweenLite.to(elToShow, 0.5, {css: {
		transform: 'translateY(0)',
		opacity:'1',
		maxHeight:'1000px'
	}, delay: 0.2});
	controlButton.className = controlButton.className.replace( /(?:^|\s)timerRunning(?!\S)/ , '' )
}