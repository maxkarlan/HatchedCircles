let styleChoices = [];
let circles = [];
let maxSize = 80; // Maximum radius size
let minSize = 2; // Minimum radius size
let totalCircles = 10000; // Total number of circles to attempt to pack
let attemptLimit = 100; // Maximum attempts before moving to a smaller size
sizeTier = 1;
let denom = 2;
let frameThickness = 15; // Thickness of the frame
let frameToRectPad = 10; // Space between the frame and the rectangle range
let rectX = [];
let rectY = [];
let rectWidth = [];
let rectHeight = [];
let rectBound = [];
let bgChoices = [[0, 0, 0], [45, 20, 100], [200, 30, 100], [114, 25, 100]];
const maxBranches = 1000;
const maxDepth = 2;
let attempts = 0;
let currentSize = null;
let circleCounts = null; 
let paletteChoices = [
   [[197, 100, 100], [0, 100, 100]],
   [[345, 100, 100], [40, 100, 100]],
   [[173, 100, 100], [244, 100, 100]],
   [[311, 100, 100], [193, 100, 100]],
   [[320, 100, 100], [60, 100, 100]]
];

let zoom = 1; // Initial zoom level

// Three.js specific setup
let scene, camera, renderer;

function setup() {
   if (windowWidth > windowHeight * (2/3)) {
      canvasHeight = windowHeight;
      canvasWidth = canvasHeight * (2/3);
   } else {
      canvasWidth = windowWidth;
      canvasHeight = canvasWidth * (3/2);
   }
   myCanvas = createCanvas(canvasWidth, canvasHeight, WEBGL);
   centerCanvas();
   window.addEventListener('wheel', (e) => {
      // Zoom in or out
      zoom += e.deltaY * -0.01;
      // Restrict scale
      zoom = constrain(zoom, 0.5, 2); // Adjust min and max zoom as needed
    });
   colorMode(HSB); // Switch to HSB color mode
   bgColor = random(bgChoices);
   styleNums = [1, 2, 3, 4, 5];
   style = random(styleNums);
   palette = shuffle(random(paletteChoices));
   color1 = palette[0];
   color2 = palette[1];
   numRect = random(1, 4);
   if (canvasHeight > canvasWidth) {
      for (let i = 0; i < numRect; i++) {
         isSquare = random() < .5;
         if (isSquare) {
            rectWidth[i] = random((canvasWidth - (2 * frameThickness))/8, (canvasWidth - (2 * frameThickness)) * (4/5));
            rectHeight[i] = rectWidth[i];
         } else {
            rectWidth[i] = random((canvasWidth - (2 * frameThickness))/8, (canvasWidth - (2 * frameThickness)) * (4/5));
            rectHeight[i] = random((canvasWidth - (2 * frameThickness))/8, (canvasWidth - (2 * frameThickness)) * (4/5));
         }
         rectX[i] = random(frameThickness + frameToRectPad, canvasWidth - rectWidth[i] - frameThickness - frameToRectPad);
         rectY[i] = random(frameThickness + frameToRectPad, canvasHeight - rectHeight[i] - frameThickness - frameToRectPad);
         rectBound[i] = random(10, 25);
      }
   } else {
      for (let i = 0; i < numRect; i++) {
         isSquare = random() < .5;
         if (isSquare) {
            rectWidth[i] = random((canvasHeight - (2 * frameThickness))/8, (canvasHeight - (2 * frameThickness)) * (3/4));
            rectHeight[i] = rectWidth[i];
         } else {
            rectWidth[i] = random((canvasHeight - (2 * frameThickness))/8, (canvasHeight - (2 * frameThickness)) * (3/4));
            rectHeight[i] = random((canvasHeight - (2 * frameThickness))/8, (canvasHeight - (2 * frameThickness)) * (3/4));
         }
         rectX[i] = random(frameThickness + frameToRectPad, (canvasWidth) - (rectWidth) - frameThickness - frameToRectPad);
         rectY[i] = random(frameThickness + frameToRectPad, (canvasHeight) - (rectHeight) - frameThickness - frameToRectPad);
         rectBound[i] = random(10, 25);
      }
   }
   currentSize = maxSize;
   circleCounts = {}; // Track the number of circles for each size

   if (style == 5) {
      setupThreeJS();
   } else {
      background(bgColor);
   }
}

function saveArtwork() {
   saveCanvas(myCanvas, 'myArtwork', 'jpg'); // Save the canvas as 'myArtwork.jpg'
}

function centerCanvas() {
   let x = (windowWidth - width) / 2;
   let y = (windowHeight - height) / 2;
   myCanvas.position(x, y);
 }

function windowResized() {
   centerCanvas();
}

function draw() {
   translate(-width / 2, -height / 2); // Adjust for WEBGL's center origin

   // scale(zoom); // Apply zoom scaling

   if (circles.length < totalCircles) {
      currentSize = max(currentSize, minSize);
      let maxCircles;
      circleCounts[currentSize] = 0; // Initialize count for the current size
      maxCircles = Math.floor(Math.pow(3, (sizeTier * 1.25)));
      if (circleCounts[currentSize] < maxCircles) {
         let y = random(height);
         let newCircle = nextCircle();
         if (style == 4) {
            calculateScribbles(newCircle);
         }
         circles.push(newCircle);
      }
      if (circles.length > 0) {
         if (style == 1) {
            parallelHatch();
         } else if (style == 2) {
            crossHatch();
         } else if (style == 3) {
            contourHatch();
         } else if (style ==4 ) {
            scribbleHatch();
         } else if (style ==5) {
            threeDim();
         }
      }
   }

   if (style == 5) {
      renderer.render(scene, camera);
  }
}

function newCircle(){
   y = random(height);
   let newCircle = {
      x: random(width),
      y: y,
      r: currentSize,
      color: getRandomColor(y / height),
      randomAngle: random(TWO_PI),
      crossHatch: PI/2,
      scribbles: []
   };
   return newCircle;
}

function nextLayer(branches){
   let new_branches = [];
   for (let b of branches) {
      for (let i = 0; i < maxBranches; i++){
         // make copy of b. Call it new_b
         let new_b = [...b];
         //append new circle to new_b
         new_b.push(newCircle());
         //append new_b to new_branches
         new_branches.push(new_b);
      }
   }
   if (branches.length === 0){
      for (let i = 0; i < maxBranches; i++){
         // make copy of b. Call it new_b
         let new_b = [];
         //append new circle to new_b
         new_b.push(newCircle());
         //append new_b to new_branches
         new_branches.push(new_b);
      }
   }
   return new_branches;
}

function validNewLayer(branches){
   return branches.filter(b => !collides(b[b.length - 1], b.slice(0, -1)));
}

function getHeadAtRandom(branches){
   return random(branches)[0];
}

function shrink(){
   currentSize = currentSize * (sizeTier/denom); 
   sizeTier += 1;
   denom += 1;
}

function nextCircle() {
   let branches = [];
   for(let i = 0; i < maxDepth; i++){
      if (i === maxDepth - 1) {
         let new_branches = [];
         for (let b of branches) {
            for (let i = 0; i < maxBranches; i++){
               // make copy of b. Call it new_b
               //append new circle to new_b
               const c = newCircle();
               if (!collides(c, b)){
                  return b[0];
               }
            }
         }
         if (branches.length === 0){
            for (let i = 0; i < maxBranches; i++){
               // make copy of b. Call it new_b
               const c = newCircle();
               if (!collides(c)){
                  return c;
               }
            }
         }
      } else {
         let new_branches = nextLayer(branches);
         new_branches = validNewLayer(new_branches);
         if (new_branches.length === 0) {
            if (branches.length === 0){
               shrink();
               return nextCircle();
            }
            return getHeadAtRandom(branches);
         }
         delete branches;
         branches = new_branches;
      }
   }
   if (branches.length === 0) {
      shrink();
      return nextCircle();
   } else {
      return getHeadAtRandom(branches);
   }
}

function parallelHatch() {
   for (let circle of [circles[circles.length - 1]]) {
      let numLines = circle.r * 3; // Proportional to the radius
      let lineSpacing = (circle.r * 2) / numLines;

      push(); // Isolate transformations
      translate(circle.x, circle.y); // Move to the circle's center
      rotate(circle.randomAngle); // Apply rotation
      
      fill(circle.color);
      noStroke();
      ellipse(0, 0, circle.r * 2, circle.r * 2);

      stroke(0, 0, 0); // Color of the hatching lines
      strokeWeight(.2); // Thickness of the hatching lines

      for (let i = 0; i <= numLines; i++) {
         let y = -circle.r + i * lineSpacing;
         let xDelta = sqrt(circle.r * circle.r - y * y);
         line(-xDelta, y, xDelta, y);
      }

      pop(); // Revert transformations
   }
}

function crossHatch() {
   for (let circle of [circles[circles.length - 1]]) {
      let numLines = circle.r * 1.5; // Proportional to the radius
      let lineSpacing = (circle.r * 2) / numLines;

      push(); // Isolate transformations
      translate(circle.x, circle.y); // Move to the circle's center
      rotate(circle.randomAngle); // Apply rotation

      fill(circle.color);
      noStroke();
      ellipse(0, 0, circle.r * 2, circle.r * 2);

      stroke(0, 0, 0); // Color of the hatching lines
      strokeWeight(.35); // Thickness of the hatching lines

      for (let i = 0; i <= numLines; i++) {
         let y = -circle.r + i * lineSpacing;
         let xDelta = sqrt(circle.r * circle.r - y * y);
         line(-xDelta, y, xDelta, y);
      }

      rotate(circle.crossHatch); // Apply rotation

      for (let j = 0; j <= numLines; j++) {
         let y = -circle.r + j * lineSpacing;
         let xDelta = sqrt(circle.r * circle.r - y * y);
         line(-xDelta, y, xDelta, y);
      }

      pop(); // Revert transformations
   }
}

function contourHatch(){
   for (let circle of [circles[circles.length - 1]]) {
      let numContours = circle.r / 2; // Adjust the density of contour lines
      let contourSpacing = circle.r / numContours;

      push(); // Isolate transformations
      translate(circle.x, circle.y); // Move to the circle's center
      rotate(circle.randomAngle); // Apply rotation

      fill(circle.color);
      noStroke();
      ellipse(0, 0, circle.r * 2, circle.r * 2);

      stroke(0, 0, 0); // Color of the hatching lines
      strokeWeight(.45); // Thickness of the hatching lines

      // Draw each contour line
      for (let i = 0; i < numContours; i++) {
          let contourRadius = circle.r - i * contourSpacing;
          if (contourRadius > 0) {
              ellipse(0, 0, contourRadius * 2, contourRadius * 2);
          }
      }

      pop(); // Revert transformations
   }
}

function scribbleHatch() {
   for (let circle of [circles[circles.length - 1]]) {
      push(); // Isolate transformations
      translate(circle.x, circle.y); // Move to the circle's center

      // Render pre-calculated scribbles
      for (let scribble of circle.scribbles) {
         noFill();
         stroke(scribble.fillHue, saturation(circle.color), brightness(circle.color));
         strokeWeight(1);
         bezier(scribble.startX, scribble.startY, scribble.controlPoint1X, scribble.controlPoint1Y, scribble.controlPoint2X, scribble.controlPoint2Y, scribble.endX, scribble.endY);
      }

      pop(); // Revert transformations
   }
}

function threeDim() {
   for (let circle of [circles[circles.length - 1]]) {
      createThreeJSSphere(circle);
  }
}

function stippleHatch() {

}

function zigZagHatch() {

}

function setupThreeJS() {

   // Assuming canvasWidth and canvasHeight are the dimensions of your p5.js canvas
   let canvasWidth = myCanvas.width;
   let canvasHeight = myCanvas.height;

   scene = new THREE.Scene();
   camera = new THREE.OrthographicCamera(-canvasWidth / 2, canvasWidth / 2, canvasHeight / 2, -canvasHeight / 2, 1, 1000);
   renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable transparency if needed
   renderer.setSize(canvasWidth, canvasHeight);

   // Set the renderer to the same size as the canvas
   renderer = new THREE.WebGLRenderer({ alpha: true }); // Enable transparency
   renderer.setSize(canvasWidth, canvasHeight);
   // Center the renderer in the window
   renderer.domElement.style.position = 'absolute';
   renderer.domElement.style.top = '50%';
   renderer.domElement.style.left = '50%';
   renderer.domElement.style.transform = 'translate(-50%, -50%)';

   // Add the renderer to the body or a specific element in your HTML
   document.body.appendChild(renderer.domElement);

   // Assuming bgColor is something like [hue, saturation, brightness]
   let bgColorRGB = HSBtoRGB(bgColor[0], bgColor[1], bgColor[2]);
   let backgroundColor = new THREE.Color(`rgb(${bgColorRGB[0]}, ${bgColorRGB[1]}, ${bgColorRGB[2]})`);
    
   // Set the background color of the renderer
   renderer.setClearColor(backgroundColor);

   // Position the camera to view the scene
   camera.position.set(0, 0, 500); // Adjust the Z position as needed
   camera.lookAt(scene.position); // Make the camera look at the center of the scene

   // Point Light
   let pointLight = new THREE.PointLight(0xffffff, 1, 5000);
   pointLight.position.set(50, 50, 150);
   scene.add(pointLight);

   camera.position.z = 500;
}

function createThreeJSSphere(circle) {
   let geometry = new THREE.SphereGeometry(circle.r, 32, 32);
   //  let material = new THREE.MeshBasicMaterial({ color: circle.color });

   // Generate color using the same method as in p5.js
   let color = getRandomColor(circle.y / window.innerHeight); // Adjust as necessary
   
   // Use MeshStandardMaterial or MeshPhongMaterial for better lighting effects
   let material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5, // Adjust for material roughness
      metalness: 0.1  // Adjust for metalness
   });

   let sphere = new THREE.Mesh(geometry, material);

   // sphere.position.set(circle.x, circle.y, 0);
      // Adjust position to align with p5.js coordinates
      sphere.position.set(circle.x - myCanvas.width / 2, -circle.y + myCanvas.height / 2, 0);
   scene.add(sphere);
}

// Function to convert HSB to RGB
function HSBtoRGB(h, s, b) {
   s /= 100;
   b /= 100;
   let k = (n) => (n + h / 60) % 6;
   let f = (n) => b - b * s * Math.max(Math.min(k(n), 4 - k(n), 1), 0);
   return [
      Math.round(255 * f(5)), // Red
      Math.round(255 * f(3)), // Green
      Math.round(255 * f(1))  // Blue
   ];
}

function getRandomColor(position) {
   // Define the mean and standard deviation for the normal distribution
   let hueMean = lerp(color1[0], color2[0], position);
   let hueSD = 40; // Standard deviation
 
   // Generate a random hue value based on the normal distribution
   let hue = randomGaussian(hueMean, hueSD);
 
   // Keep the hue within the 0-360 range
   hue = (hue + 360) % 360;

   if (style === 5) {
      return new THREE.Color(`hsl(${hue}, 100%, 50%)`); // Convert HSB/HSV to HSL
   } else {
      return color(hue, 100, 100);
   }
}

function collides(circle, additional_circles=[]) {
   for (let other of circles.concat(additional_circles)) {
      let d = dist(circle.x, circle.y, other.x, other.y);
      if (d < circle.r + other.r) {
         return true;
      }
   }

   // Check collision with the frame
   let frameInnerEdgeX = frameThickness;
   let frameInnerEdgeY = frameThickness;
   let frameOuterEdgeX = width - frameThickness;
   let frameOuterEdgeY = height - frameThickness;

   if (circle.x - circle.r < frameInnerEdgeX ||
      circle.x + circle.r > frameOuterEdgeX ||
      circle.y - circle.r < frameInnerEdgeY ||
      circle.y + circle.r > frameOuterEdgeY) {
      return true;
   }

   // Check collision with the rectangle
   for (let i = 0; i < numRect; i++) {
      if ((circle.x + circle.r > rectX[i] &&
         circle.x - circle.r < rectX[i] + rectBound[i] &&
         circle.y + circle.r > rectY[i] &&
         circle.y - circle.r < rectY[i] + rectHeight[i]) ||

         (circle.y + circle.r > rectY[i] &&
         circle.y - circle.r < rectY[i] + rectBound[i] &&
         circle.x + circle.r > rectX[i] &&
         circle.x - circle.r < rectX[i] + rectWidth[i]) ||

         (circle.x - circle.r < rectX[i] + rectWidth[i] &&
         circle.x + circle.r > rectX[i] + rectWidth[i] - rectBound[i] &&
         circle.y + circle.r > rectY[i] &&
         circle.y - circle.r < rectY[i] + rectHeight[i]) ||

         (circle.y - circle.r < rectY[i] + rectHeight[i] &&
         circle.y + circle.r > rectY[i] + rectHeight[i] - rectBound[i] &&
         circle.x + circle.r > rectX[i] &&
         circle.x - circle.r < rectX[i] + rectWidth[i])) {

         return true;
      }
   }

   return false;
}

function calculateScribbles(circle) {
   let numScribbles = (PI * circle.r * circle.r) / 5; // Proportional to the area

   for (let i = 0; i < numScribbles; i++) {
       let startX = random(-circle.r, circle.r);
       let startY = random(-circle.r, circle.r);
       let endX = random(-circle.r, circle.r);
       let endY = random(-circle.r, circle.r);

       // Ensure start and end points are within the circle
       if (dist(0, 0, startX, startY) < circle.r && dist(0, 0, endX, endY) < circle.r) {
           let controlPoint1X = random(-circle.r, circle.r);
           let controlPoint1Y = random(-circle.r, circle.r);
           let controlPoint2X = random(-circle.r, circle.r);
           let controlPoint2Y = random(-circle.r, circle.r);
           let hueDiff = random(-20, 20);
           let fillHue = (hue(circle.color) + hueDiff);
           fillHue = (fillHue + 360) % 360;

           // Store each scribble
           circle.scribbles.push({startX, startY, controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY, fillHue});
       }
   }
}