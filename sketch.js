let model;
let video;
let predictions = [];
let playerX;
let playerY;
let obstacles = [];
let gameOver = false;
let confianza = 0;

function preload() {
  const modelURL = "https://teachablemachine.withgoogle.com/models/5UJKOSdX2/";
  model = ml5.imageClassifier(modelURL);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  
  playerX = width / 2;
  playerY = height - 50;

  classifyVideo();
}

function classifyVideo() {
  model.classify(video, gotResult);
}

function gotResult(results, error) {
  if (error) {
    console.error(error);
    return;
  }
  predictions = results;
  classifyVideo();

  // La confianza está en la propiedad confidence 
  confianza = results[0].confidence;
}

function draw() {
  background(220);
  image(video, 0, 0, 160, 120); // Mostrar el video en la esquina
  fill(0);
  textSize(16);
  text('Confianza: ' + nf(confianza, 0, 2), 10, height - 10); // Mostrar la confianza

  if (!gameOver) {
    // Mostrar el personaje
    fill(0, 255, 0);
    ellipse(playerX, playerY, 50, 50);

    // Lógica del movimiento según la predicción
    if (predictions.length > 0 && confianza > 0.5) { //se mueve si es mayor a 0.5
      let label = predictions[0].label;
      if (label === 'Abierto') {
        playerX += 5; // Mover a la derecha
      } else if (label === 'Cerrado') { 
        playerX -= 5; // Mover a la izquierda
      }
    }

    // Limitar los bordes de la pantalla
    playerX = constrain(playerX, 0, width);

    // Crear obstáculos
    if (frameCount % 60 === 0) {
      let obstacle = {
        x: random(width),
        y: 0,
        w: 40,
        h: 40
      };
      obstacles.push(obstacle);
    }

    // Dibujar los obstáculos y moverlos
    for (let i = 0; i < obstacles.length; i++) {
      fill(255, 0, 0);
      strokeWeight();
      rect(obstacles[i].x, obstacles[i].y, obstacles[i].w, obstacles[i].h);
      obstacles[i].y += 5;

      // Checar colisiones
      if (dist(playerX, playerY, obstacles[i].x + obstacles[i].w / 2, obstacles[i].y + obstacles[i].h / 2) < 25) {
        gameOver = true;
      }
    }

    // Limpiar los obstáculos que ya salieron de la pantalla
    obstacles = obstacles.filter(ob => ob.y < height);
  } else {
    // Mensaje de fin del juego
    textSize(32);
    fill(0);
    textAlign(CENTER);
    text('Game Over', width / 2, height / 2);
  }
}
