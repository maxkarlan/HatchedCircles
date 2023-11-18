let circles = [];
let maxSize = 80; // Maximum radius size
let minSize = 2; // Minimum radius size
let totalCircles = 5000; // Total number of circles to attempt to pack
let attemptLimit = 5000; // Maximum attempts before moving to a smaller size
let 
// let skyBlueHSB = [197, 71, 88]; // HSB for sky blue
// let deepRedHSB = [0, 100, 50];  // HSB for deep red
sizeTier = 1;
let denom = 3;
let darkPaletteChoices = [
   [[311, 78, 45], [193, 85, 29]],
   [[0, 0, 2], [187, 84, 67]]
]
let lightPaletteChoices = [
   [[197, 71, 88], [0, 100, 50]],
   [[345, 52, 100], [40, 65, 100]],
   [[173, 27, 100], [244, 93, 100]]
]
let saveButton;

function setup() {
   myCanvas = createCanvas(500, 500, WEBGL);
   centerCanvas();
   colorMode(HSB); // Switch to HSB color mode
   isDark = random() < .5;
   console.log("isDark:", isDark);
   if (isDark) {
      palette = shuffle(random(darkPaletteChoices));
   } else {
      palette = shuffle(random(lightPaletteChoices));
   }
   color1 = palette[0];
   color2 = palette[1];
   console.log("color1:", color1);
   console.log("color2:", color2);
   let currentSize = maxSize;
   let circleCounts = {}; // Track the number of circles for each size
   // isDark = random() < .5
   while (circles.length < totalCircles && currentSize >= minSize) {
      let attempts = 0;
      let maxCircles;
      circleCounts[currentSize] = 0; // Initialize count for the current size
      maxCircles = Math.floor(Math.pow(3, (sizeTier * 1.25)));
      while (circleCounts[currentSize] < maxCircles && attempts < attemptLimit) {
         let y = random(height);
         let newCircle = {
            x: random(width),
            y: y,
            r: currentSize,
            color: getRandomColor(y / height),
            randomAngle: random(TWO_PI)
         };
         if (!collides(newCircle)) {
            circles.push(newCircle);
            circleCounts[currentSize]++;
            console.log("Circle created with size: " + currentSize); // Log the size of each circle
         }
         attempts++;
      }
      if (attempts >= attemptLimit || circleCounts[currentSize] >= maxCircles) {
         currentSize = currentSize * (sizeTier/denom); // Decrease the circle size
         sizeTier = sizeTier + 1;
         denom = sizeTier + 1;
      }
   }
   // Create and position the save button
   saveButton = createButton('Save as JPG');
   saveButton.position(10, height + 10); // Adjust the position as needed
   saveButton.mousePressed(saveArtwork); // Attach event listener
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
   background(255);
   translate(-width / 2, -height / 2); // Adjust for WEBGL's center origin
   for (let circle of circles) {
      let numLines = circle.r * 3; // Proportional to the radius
      let lineSpacing = (circle.r * 2) / numLines;
      // let randomAngle = random(TWO_PI); // Random rotation angle

      push(); // Isolate transformations
      translate(circle.x, circle.y); // Move to the circle's center
      rotate(circle.randomAngle); // Apply rotation

      if (isDark) {
         fillLight = 10;
         fill(color(hue(circle.color), fillLight, brightness(circle.color)));
         console.log("fillLight:", fillLight);
      } else {
         fillDark = 10;
         fill(color(hue(circle.color), saturation(circle.color), fillDark));
         console.log("fillDark:", fillDark);
      }
      noStroke();
      ellipse(0, 0, circle.r * 2, circle.r * 2);

      stroke(circle.color); // Color of the hatching lines
      strokeWeight(.5); // Thickness of the hatching lines
      for (let i = 0; i <= numLines; i++) {
         let y = -circle.r + i * lineSpacing;
         let xDelta = sqrt(circle.r * circle.r - y * y);
         line(-xDelta, y, xDelta, y);
       }
   
       pop(); // Revert transformations
   }
}

function getRandomColor(position) {
   // Define the mean and standard deviation for the normal distribution
   let hueMean = lerp(color1[0], color2[0], position);
   let hueSD = 40; // Standard deviation
   let sat = lerp(color1[1], color2[1], position);
   // let satSD = 10;
   let bright = lerp(color1[2], color2[2], position);
   // let brightSD = 10;
 
   // Generate a random hue value based on the normal distribution
   let hue = randomGaussian(hueMean, hueSD);
   // let sat = randomGaussian(satMean, satSD);
   // let bright = randomGaussian(brightMean, brightSD);
 
   // Keep the hue within the 0-360 range
   hue = (hue + 360) % 360;
   // sat = (sat + 100) % 100;
   // bright = (bright + 100) % 100;
 
   // Return the HSB color
   return color(hue, sat, bright);
}

function collides(circle) {
   for (let other of circles) {
      let d = dist(circle.x, circle.y, other.x, other.y);
      if (d < circle.r + other.r) {
         return true;
      }
   }
   return false;
}
