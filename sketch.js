let player, gems;
let model, webcam, label;

function setup() {
  createCanvas(160, 456);

  // Load the Teachable Machine model
  const URL = 'https://teachablemachine.withgoogle.com/models/sVz4HXE1K/';
  model = ml5.imageClassifier(URL + 'model.json', modelReady);

  // Start the webcam and hide the video feed
  webcam = createCapture(VIDEO);
  webcam.hide();

  // Create the sprite group and set up the player
  gems = new Group();
  gems.diameter = 10;
  gems.x = () => random(0, width);
  gems.y = () => random(0, height);
  gems.amount = 80;
  player = new Sprite();
  player.overlaps(gems, collect);

  // Load the ML-driven game controller
  const penController = new PenController();
  penController.loadModel('https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pen/pen.json', () => {
    // Start the pen controller
    penController.start();
    // Set the player's movement function based on the pen controller's classification result
    player.moveFunction = () => {
      if (penController.label === 'up') {
        player.move(0, -5); // move up
      } else if (penController.label === 'left') {
        player.move(-5, 0); // move left
      } else if (penController.label === 'right') {
        player.move(5, 0); // move right
      } else if (penController.label === 'down') {
        player.move(0, 5); // move down
      }
    };
  });
}

function modelReady() {
  console.log('Model is ready!');

  // Start classifying the webcam feed
  classifyVideo();
}

async function classifyVideo() {
  // Get a prediction from the model
  const prediction = await model.classify(webcam);

  // Get the label of the highest confidence prediction
  label = prediction[0].label;

  // Move the player sprite based on the classification result
  if (label === 'red pen') {
    player.move(0, -5); // move up
  } else if (label === 'background') {
    // do nothing
  } else {
    player.move(0, 5); // move down
  }

  // Continue classifying the video feed recursively
  classifyVideo();
}

function collect(player, gem) {
  gem.remove();
}

function draw() {
  // Show the webcam feed
  image(webcam, 0, 0, width, height);

  // Draw the player and gems
  player.draw();
  gems.draw();

  // Move the player towards the mouse
  player.moveTowards(mouseX, mouseY);
}


