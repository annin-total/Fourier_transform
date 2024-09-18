let audioContext, source, analyser, audioBuffer;
let isPlaying = false;
let isLooping = false;

const dropZone = document.getElementById('dropZone');
const audioFileInput = document.getElementById('audioFileInput');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const loopBtn = document.getElementById('loopBtn');
const resetBtn = document.getElementById('resetBtn');
const canvas = document.getElementById('frequencyCanvas');
const canvasCtx = canvas.getContext('2d');

// ドラッグ&ドロップイベントの設定
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
        handleAudioFile(file);
    }
});

dropZone.addEventListener('click', () => {
    audioFileInput.click();
});

audioFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        handleAudioFile(file);
    }
});

function handleAudioFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        setupAudioContext(e.target.result);
    };
    reader.readAsArrayBuffer(file);
}

function setupAudioContext(arrayBuffer) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.decodeAudioData(arrayBuffer, function(buffer) {
        audioBuffer = buffer;
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        playBtn.disabled = false;
        pauseBtn.disabled = false;
    });
}

playBtn.addEventListener('click', () => {
    if (!isPlaying) {
        playAudio();
    }
});

pauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseAudio();
    }
});

loopBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    loopBtn.textContent = isLooping ? 'ループ解除' : 'ループ再生';
    if (source) {
        source.loop = isLooping;
    }
});

resetBtn.addEventListener('click', () => {
    resetAudio();
});

function playAudio() {
    if (!audioContext) return;

    source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    source.loop = isLooping;
    source.start(0);
    isPlaying = true;

    drawFrequencyData();
}

function pauseAudio() {
    if (source) {
        source.stop();
        isPlaying = false;
    }
}

function resetAudio() {
    if (source) {
        source.stop();
    }
    audioContext = null;
    source = null;
    analyser = null;
    audioBuffer = null;
    isPlaying = false;
    isLooping = false;
    playBtn.disabled = true;
    pauseBtn.disabled = true;
    loopBtn.textContent = 'ループ再生';
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// 周波数が赤の単色
// function drawFrequencyData() {
//     canvas.width = window.innerWidth * 0.8;
//     canvas.height = 300;

//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);

//     function draw() {
//         if (!isPlaying) return;

//         requestAnimationFrame(draw);
//         analyser.getByteFrequencyData(dataArray);

//         canvasCtx.fillStyle = 'rgb(120, 120, 120)';
//         canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

//         const barWidth = (canvas.width / bufferLength) * 2.5;
//         let barHeight;
//         let x = 0;

//         for (let i = 0; i < bufferLength; i++) {
//             barHeight = dataArray[i];
//             canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
//             canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
//             x += barWidth + 1;
//         }
//     }

//     draw();
// }

function drawFrequencyData() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = 300;

  const bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
      if (!isPlaying) return;

      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          // 周波数に応じて色を変更
          // レインボーグラデーション
            // const hue = i / bufferLength * 360;
            // canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
          // 単色グラデーション
            const intensity = barHeight / 255;
            canvasCtx.fillStyle = `rgb(${Math.round(intensity * 255)}, 20, 100)`;
            // canvasCtx.fillStyle = `rgb(${Math.round(intensity * 255)}, 48, 100)`;
          // 白黒グラデーション 
            // canvasCtx.fillStyle = `rgb(${Math.round(intensity * 255)}, ${Math.round(intensity * 255)}, ${Math.round(intensity * 255)})`;

          canvasCtx.fillRect(x, canvas.height - barHeight / 1.3, barWidth, barHeight / 1.3);
          x += barWidth + 1;
      }
  }

  draw();
}