const segments = 100;
const segmentLength = 10;
let snake = [];
let angle = 0;
let followMouse = false;  // Flag to track if the snake should follow the mouse

let starVertices = [];
let pyramids = [];

function setup() {
  createCanvas(800, 800, WEBGL);

  // Initialize snake segments
  for (let i = 0; i < segments; i++) {
    snake.push(createVector(-i * segmentLength, 0, 0));
  }

  // Define the star shape base
  let radius1 = 100; // Outer radius
  let radius2 = 50;  // Inner radius
  let angleStep = TWO_PI / 5; // 5 points for a star

  for (let i = 0; i < TWO_PI; i += angleStep) {
    let x1 = cos(i) * radius1;
    let y1 = sin(i) * radius1;
    starVertices.push(createVector(x1, y1, 0));

    let x2 = cos(i + angleStep / 2) * radius2;
    let y2 = sin(i + angleStep / 2) * radius2;
    starVertices.push(createVector(x2, y2, 0));
  }

  // Generate pyramids with their apex at the center of the next base
  let currentBaseCenter = createVector(0, 0, 0); // Starting center
  let offset = createVector(0, 0, 250); // Offset between bases along Z-axis

  for (let i = 0; i < 10; i++) { // Limit to 10 pyramids for better visuals
    let nextBaseCenter = currentBaseCenter.copy().add(offset);
    pyramids.push({ baseCenter: currentBaseCenter, apex: nextBaseCenter });
    currentBaseCenter = nextBaseCenter; // Update for the next pyramid
  }
}

function drawPyramid(baseCenter, apex) {
  push();
  translate(baseCenter.x, baseCenter.y, baseCenter.z);

  // Draw the base
  fill(150, 100, 255);
  stroke(0);
  strokeWeight(2);
  beginShape();
  for (let v of starVertices) {
    vertex(v.x, v.y, v.z);
  }
  endShape(CLOSE);

  // Draw the triangular sides
  fill(255, 150, 100);
  for (let i = 0; i < starVertices.length; i++) {
    let v1 = starVertices[i];
    let v2 = starVertices[(i + 1) % starVertices.length]; // Wrap around to the first vertex
    beginShape();
    vertex(v1.x, v1.y, v1.z);
    vertex(v2.x, v2.y, v2.z);
    vertex(apex.x - baseCenter.x, apex.y - baseCenter.y, apex.z - baseCenter.z);
    endShape(CLOSE);
  }
  pop();
}

function draw() {
  background(0);
  orbitControl();

  if (followMouse) {
    // Snake follows the mouse position
    let head = snake[0];
    let target = createVector(mouseX - width / 2, mouseY - height / 2, 0);  // Convert mouse position to canvas center
    let dir = p5.Vector.sub(target, head).normalize();
    head.add(dir.mult(segmentLength));
    
    // Update the positions of the rest of the segments
    for (let i = 1; i < snake.length; i++) {
      let prev = snake[i - 1];
      let current = snake[i];
      let direction = p5.Vector.sub(prev, current).normalize();
      direction.mult(segmentLength);
      current.set(prev.x - direction.x, prev.y - direction.y, prev.z - direction.z);
    }
  } else {
    // Snake moves automatically in a circular pattern
    angle += 0.05;
    let head = snake[0];
    head.x = 200 * sin(angle);
    head.y = 200 * sin(angle / 2);
    head.z = 200 * cos(angle);
    
    // Update the positions of the rest of the segments
    for (let i = 1; i < snake.length; i++) {
      let prev = snake[i - 1];
      let current = snake[i];
      let direction = p5.Vector.sub(prev, current).normalize();
      direction.mult(segmentLength);
      current.set(prev.x - direction.x, prev.y - direction.y, prev.z - direction.z);
    }
  }

  // Draw the snake
  noFill();
  stroke(0, 255, 0);  // Neon-Grün
  strokeWeight(5);
  beginShape();
  for (let v of snake) {
    vertex(v.x, v.y, v.z);
  }
  endShape();

  // Draw pyramids at each segment of the snake
  for (let i = 0; i < snake.length; i++) {
    let segment = snake[i];
    push();
    translate(segment.x, segment.y, segment.z);  // Move to the position of the current segment

    // Calculate the direction in which the snake is pointing at this segment
    let direction = createVector(0, 0, 1);  // Default forward direction (along Z-axis)
    if (i > 0) {
      let nextSegment = snake[i - 1];
      direction = p5.Vector.sub(nextSegment, segment).normalize();  // Get direction to the next segment
    }
    
    // Rotate the pyramid to face the direction of the snake
    let angleToRotate = atan2(direction.y, direction.x);  // Rotation around Z-axis
    rotateZ(angleToRotate);  // Apply the rotation

    // Draw the pyramid at this segment
    drawPyramid(createVector(0, 0, 0), createVector(0, 0, 250));

    pop();  // Restore the transformation state
  }
}

function keyPressed() {
  if (key === ' ') {  // Check if the spacebar is pressed
    followMouse = !followMouse;  // Toggle the followMouse flag
  }
}

