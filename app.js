const canvas = document.getElementById('balloonCanvas');
const ctx = canvas.getContext('2d');
let balloonSize = 50;
let targetBalloonSize = 50;
let particles = [];
let backgroundMusic = new Audio();
backgroundMusic.src = 'data:audio/wav;base64,...';  // Replace with base64 or URL
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
backgroundMusic.play();

// Sound effect for balloon popping
let popSound = new Audio();
popSound.src = 'data:audio/wav;base64,...';  // Replace with base64 sound data

// Draw the balloon with a gradient
function drawBalloon() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createRadialGradient(
        canvas.width / 2 - balloonSize / 4,
        canvas.height / 2 - balloonSize / 4,
        balloonSize / 10,
        canvas.width / 2,
        canvas.height / 2,
        balloonSize
    );
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'red');

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, balloonSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#ff5e5e';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Inflate the balloon with smooth animation
function inflateBalloon() {
    targetBalloonSize += 5;
    animateBalloon();
}

function animateBalloon() {
    if (balloonSize < targetBalloonSize && balloonSize < 180) {
        balloonSize += (targetBalloonSize - balloonSize) * 0.1;
        drawBalloon();
        requestAnimationFrame(animateBalloon);
    } else if (balloonSize >= 180) {
        popBalloon();
    }
}

// Pop the balloon with burst effect
function popBalloon() {
    createParticles();
    drawParticles();
    playSound(popSound);
    fadeOutMusic();
    document.getElementById('message').innerText = 'You did it! Happy Anniversary!';
}

// Create particles for pop effect
function createParticles() {
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            speedX: (Math.random() - 0.5) * 5,
            speedY: (Math.random() - 0.5) * 5,
            alpha: 1
        });
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle, index) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.alpha -= 0.02;

        // Remove faded particles
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });

    ctx.globalAlpha = 1;
    if (particles.length > 0) {
        requestAnimationFrame(drawParticles);
    }
}

// Play sound effect
function playSound(sound) {
    sound.play();
}

// Fade out background music
function fadeOutMusic() {
    const fadeOutInterval = setInterval(() => {
        if (backgroundMusic.volume > 0.1) {
            backgroundMusic.volume -= 0.1;
        } else {
            backgroundMusic.pause();
            clearInterval(fadeOutInterval);
        }
    }, 100);
}

// Detect microphone input for blowing
function startMicrophone() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function detectBlow() {
                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((a, b) => a + b) / bufferLength;

                if (volume > 50) {
                    inflateBalloon();
                }

                requestAnimationFrame(detectBlow);
            }

            detectBlow();
        })
        .catch(error => {
            console.error('Error accessing the microphone', error);
            alert('Please allow microphone access to play this game.');
        });
}

// Initialize the game
drawBalloon();
startMicrophone();
