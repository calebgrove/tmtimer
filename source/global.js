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

var bgElement        = document.getElementById('wrapper'),
	grower            = document.getElementById('grower'),
	clockElement      = document.getElementById('clock'),
	controlButton     = document.getElementById('controlButton'),
	resetButton       = document.getElementById('resetButton'),
	infoButton        = document.getElementById('infoButton'),
	clockWrapper      = document.getElementById('clockWrapper'),
	infoWrapper       = document.getElementById('info'),
	customGreenLight  = customArray[0],
	customYellowLight = customArray[1],
	customRedLight    = customArray[2],
	customDq          = customArray[3];

var showClock = document.getElementById('showClock');

var clockIntervalId   = undefined,
	minColorTimeoutId  = undefined,
	midColorTimeoutId  = undefined,
	maxColorTimeoutId  = undefined,
	fullColorTimeoutId = undefined,
	pulsateIntervalId  = undefined,
	currentTime        = 0;

var minTime        = undefined,
	midTime         = undefined,
	maxTime         = undefined,
	dqTime          = undefined,
	growerAnimation = undefined;

var defaultColor = 'hsl(0, 0%, 27%)',    // gray
	minColor      = 'hsl(119, 59%, 52%)', // green
	midColor      = 'hsl(51, 78%, 57%)',  // yellow
	maxColor      = 'hsl(353, 76%, 58%)'; // red

TweenLite.defaultEase = Linear.easeNone;

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

	return minutes + ':' + seconds;
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

// watch space bar and modify start button
function onSpaceKey(buttonAction) {
	document.onkeypress = function (e) {
		if (e.keyCode == 32) {
			// check if an input is currently in focus
			if (document.activeElement.nodeName.toLowerCase() != "button") {
				// prevent default spacebar event (scrolling to bottom)
				e.preventDefault();
				buttonAction();
			}
		}
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
		transform: 'translate(-2000px)',
		opacity:'0',
		maxHeight:'0',
		margin:'0'
	}});
	TweenLite.to(clockElement, 0.2, {css:{paddingLeft:'0'}, delay:0.5});
	TweenLite.to(infoButton, 0.5, {css: {opacity:'0',}});
	controlButton.className += ' timerRunning';
	resetButton.className += ' timerRunning';
	//console.log("controls hidden");
}

function showControls() {
	var elToShow = document.getElementById('hideAway');
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	if(w > 570){
		// we only want the clock to slide 300px to the right if we are at a large viewport
		var fullClockAnimation = TweenLite.to(clockElement, 0.2, {css:{paddingLeft:'300px'}});
	} else {
		wrapper.style.bottom = "auto";
	}
	TweenLite.to(elToShow, 0.5, {css: {
		transform: 'translateY(0)',
		opacity:'1',
		maxHeight:'1000px',
		height: 'auto'
	}, delay: 0.2});
	TweenLite.to(infoButton, 0.5, {css: {opacity:'1',}});
	controlButton.className = controlButton.className.replace( /(?:^|\s)timerRunning(?!\S)/ , '' )
}

function showInfo() {
	// Blur the background
	TweenLite.to(bgElement, 0.5, {css: {
		filter: 'blur(10px)',
	}, delay: 0.2});

	TweenLite.to(infoButton, 0.5, {css: {
		backgroundColor: 'red',
		color: 'white',
		//fontSize: '1.5em'
	}, delay: 0});

	// Make the modal visible
	TweenLite.to(infoWrapper, 0, {css: {
		display: 'flex',
	}});

	TweenLite.to(infoWrapper, 0.25, {css: {
		opacity: '1',
	}, delay: 0.2});

	//infoWrapper.onclick = hideInfo();

	infoButton.onclick = function(){ hideInfo() };
	infoButton.innerHTML = "&times;";

	// Log it to analytics:
	gtag('event', 'Info Displayed');
}

function hideInfo() {
	// Blur the background
	TweenLite.to(bgElement, 0.5, {css: {
		filter: 'blur(0)',
	}, delay: 0.2});

	TweenLite.to(infoButton, 0.5, {css: {
		backgroundColor: 'hsla(0, 0, 100, 0.7)',
		color: 'black',
		fontSize: '1em',
		fontWeight: '400',
	}, delay: 0.2});

	// Make the modal visible
	TweenLite.to(infoWrapper, 0, {css: {
		display: 'none',
	}});

	TweenLite.to(infoWrapper, 0.5, {css: {
		opacity: '0',
	}, delay: 0.2});

	infoButton.onclick = function(){ showInfo() };
	infoButton.innerHTML = "i";
}

infoButton.onclick = function(){ showInfo() };

function hideTheClock(){
	TweenLite.to(clockElement, 0.2, {css: {color:'transparent',}});
	TweenLite.to(grower, 0.2, {css: {backgroundColor:'transparent',}});
}

function showTheClock(){
	TweenLite.to(clockElement, 0.2, {css: {color:'rgba(255,255,255,0.3)',}});
	TweenLite.to(grower, 0.2, {css: {backgroundColor:'rgba(255,255,255,0.7)',}});
}

showClock.addEventListener('change', function() {
	if (showClock.checked == false) {
		hideTheClock();
	} else {
		showTheClock();
	}
});