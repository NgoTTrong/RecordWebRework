let stream = null;
let chunks = [];
let recorder = null;
let startButton = null;
let stopButton = null;
let downloadButton = null;
let recordedVideo = null;
let checkVoice = null;
let checkAudio = null;
let audio = null;
let mixedStream = null;

let constraints = {
    video: { 
        mediaSource: "screen" 
    }
}

async function setUp(){
    if (checkAudio.checked) {
        console.log("checked audio");
        constraints["audio"] = {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
        }
    }
    if (checkVoice.checked){
        console.log("checked voice");
        audio = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100,
			},
		});
    }
    try{
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
        playVideo();
    }catch(e){
        console.error(e);
    }
}

function playVideo(){
    if (stream){
        const videoScreen = document.querySelector('.videoScreen');
        videoScreen.srcObject = stream;
        videoScreen.play();
    }else{
        console.warn("Stream isn't available");
    }
}

async function startRecord(){
    await setUp();
    if (stream){
        if (audio){
            mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
		    recorder = new MediaRecorder(mixedStream);
        }else{
            recorder = new MediaRecorder(stream);
        }
        recorder.ondataavailable = handleDataAvailable;
        recorder.onstop = handleStop;
        recorder.start(200);
        startButton.disabled = true;
        stopButton.disabled = false;
        window.onbeforeunload = function(e) {
            return "Video isn't downloaded, are you sure?";
        };
    }else{
        console.warn("Stream isn't available");
    }
}


function stopRecord(){
    recorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
}

function handleDataAvailable (e) {
	chunks.push(e.data);
}

function handleStop(e){
    const blob = new Blob(chunks,{type:'video/mp4'});
    chunks = [];
    downloadButton.href = URL.createObjectURL(blob);
    downloadButton.download = 'video.mp4';
    downloadButton.disabled = false;
    recordedVideo.src = URL.createObjectURL(blob);
    recordedVideo.load();   
    recordedVideo.onloadeddata = function(){
        const wrap = document.querySelector('.recorded-video-wrap');
        wrap.removeAttribute("hidden");
        wrap.scrollIntoView({ behavior: "smooth", block: "start" });
        recordedVideo.play();
    }
    stream.getTracks().forEach((track) => track.stop());
}

window.addEventListener('load',async ()=>{
    startButton = document.querySelector('.startButton');
    stopButton = document.querySelector('.stopButton');
    downloadButton = document.querySelector('.downloadButton');
    recordedVideo = document.querySelector('.recordedVideo');
    checkAudio = document.querySelector('#audio');
    checkVoice = document.querySelector('#voice'); 

    startButton.addEventListener('click',startRecord);
    stopButton.addEventListener('click',stopRecord);
    downloadButton.addEventListener('click',()=>{
        window.onbeforeunload = function () {}
    })
});