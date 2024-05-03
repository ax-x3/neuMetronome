var beatNumber = 0;
var tempo = 500;
var beats = 4;
var pauseBeatNumber = 0;
var startBeatTS = 0;
var targetTS = 0;
var metronomeActive = false;
var pauseTS = 0;
var beatLo = new Audio('sounds/bip_lo.wav');
var beatHi = new Audio('sounds/bip_hi.wav');

var tapTempoTS = 0;
var tapTempoCollection = [];



function mReset() {
    document.getElementById("pauseButton").className = "pressedButton";
    document.getElementById("pendulum").style.rotate = "0deg";
    metronomeActive = false;
    beatNumber = 0;
    startBeatTS = 0;
    pauseTS = 0;
    updateDisplay("reset");
}

function mStart(ms, beats) {
    document.getElementById("pauseButton").className = "iconButton";
    tempo = ms;
    beatsPerMeasure = beats;
    if (!metronomeActive) {
        let nowTS = Date.now();
        startBeatTS = nowTS - pauseTS + startBeatTS;
        metronomeActive = true;
        beat(nowTS);
        animate();
    }

}
function mPause() {
    document.getElementById("pauseButton").className = "pressedButton";
    if (startBeatTS != 0) {
        pauseTS = Date.now();
        metronomeActive = false;
    }
}

function beat(referenceTS) {
    // Must check if metronome is actually active because beat() works by calling itself periodically and has to break out if the metronome is stopped.
    if (metronomeActive) {
        let nowTS = Date.now();
        // Calculate what is the current beat.
        beatNumber = 1 + Math.floor((nowTS - startBeatTS) / tempo);
        // Decide when the next beat should be.
        targetTS = startBeatTS + beatNumber * tempo;
        // Prevent playing a sound or flashing the screen by default when resuming metronome.
        if (pauseBeatNumber != beatNumber) {
            // If on the downbeat.
            if (beatNumber % beatsPerMeasure == 1) {
                if (document.getElementById("metronomeSound").checked) {
                    beatHi.load(); 
                    beatHi.play();
                }
                if (document.getElementById("metronomeFlash").checked) {
                    screenFlash(true);
                } else {
                    smallFlash();
                }
            // If not on the downbeat.
            } else {
                if (document.getElementById("metronomeSound").checked) {
                    beatLo.load(); 
                    beatLo.play();
                }
                if (document.getElementById("metronomeFlash").checked) {
                    screenFlash();
                } else {
                    smallFlash();
                }
            }
        }

        updateDisplay("counter");
       
        setTimeout(() => {
            if (metronomeActive) {
                beat(targetTS);
            } else {
                pauseBeatNumber = beatNumber;
            }
        }, targetTS - nowTS);
    }
}

function updateDisplay(action) {
    if (action == "timer") {
        document.getElementById("dTimer").innerText = new Date(Date.now() - startBeatTS).toISOString().slice(11, 23);
    } else if (action == "counter") {
        document.getElementById("dCounter").innerText = (Math.floor((beatNumber - 1) / beatsPerMeasure)).toString().padStart(3, '0') + "." + (1 + (beatNumber - 1) % beatsPerMeasure).toString().padStart(2, '0');
    } else if (action == "reset") {
        document.getElementById("dTimer").innerText = "00:00:00.000"
        document.getElementById("dCounter").innerText = "000.00"
    }
}

function screenFlash(downbeat) {
    if (downbeat) {
        document.body.style.background = "#faa";
    } else {
        document.body.style.background = "#fff";
    }
    document.body.style.transition = "none";
    setTimeout(() => {
        document.body.style.background = "#ddd";
        document.body.style.transition = "ease-in 100ms";
    }, 100);
}

function smallFlash(){
    document.getElementById("pendulumBase").style.background = "#f55";
    document.getElementById("pendulumBase").style.transition = "none";
    setTimeout(() => {
    document.getElementById("pendulumBase").style.background = "#0000";
    document.getElementById("pendulumBase").style.transition = "ease-in 100ms";
    }, 100);
}

function animate() {
    console.log("worked");
    if (metronomeActive) {
        let nowTS = Date.now();
        let animationStage = Math.PI * ((nowTS - startBeatTS) / tempo);
        document.getElementById("pendulum").style.rotate = (40 * Math.sin(animationStage)) + "deg";
        updateDisplay("timer");
        setTimeout(() => {
            animate();
        }, 5);
    }
}

function mRoundTempo() {
    tempo = parseFloat(document.getElementById('tempoInput').value)
    tempo = convertMsBpm(Math.round(tempo));
    document.getElementById("tempoInput").value = convertMsBpm(tempo);
}

function mTapTempo() {
    beatHi.load(); 
    beatHi.play();
    mReset();
    let nowTS = Date.now();
    
    if (nowTS - tapTempoTS >= 2000) {
        tapTempoCollection = [];
        tapTempoTS = nowTS;
    } else {
        tapTempoCollection.push(nowTS - tapTempoTS);
        tapTempoTS = nowTS;
        let tapSum = 0;
        tapTempoCollection.forEach(tap => {
            tapSum += tap;
        });
        tempo = tapSum / tapTempoCollection.length;
        document.getElementById("tempoInput").value = convertMsBpm(tempo);
    }
}

function mScaleTempo(scalar) {
    tempo = parseFloat(document.getElementById('tempoInput').value)
    tempo = convertMsBpm(tempo * scalar);
    document.getElementById("tempoInput").value = convertMsBpm(tempo);
}

function mOffsetTime(ms) {
    startBeatTS -= ms;
}

function mOffsetCount(beats) {
    startBeatTS -= beats * tempo;
}

function convertMsBpm(tempo) {
    return 60000 / tempo;
}