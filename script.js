let styleChoices = [];
let circles = [];
let maxSize = 80; // Maximum radius size
let minSize = 2; // Minimum radius size
let totalCircles = 5000; // Total number of circles to attempt to pack
let attemptLimit = 5000; // Maximum attempts before moving to a smaller size
sizeTier = 1;
let denom = 3;
let frameThickness = 15; // Thickness of the frame
let frameToRectPad = 10; // Space between the frame and the rectangle range
let rectX = [];
let rectY = [];
let rectWidth = [];
let rectHeight = [];
let rectBound = [];
let bgChoices = [[0, 0, 0], [45, 20, 100], [200, 30, 100]];
// let paletteChoices = [
//    [[197, 100, 88], [0, 100, 50]],
//    [[345, 100, 100], [40, 100, 100]],
//    [[173, 100, 100], [244, 100, 100]],
//    [[311, 100, 45], [193, 100, 29]],
//    [[320, 100, 95], [60, 100, 90]]
// ]
let paletteChoices = [
   [[197, 100, 100], [0, 100, 100]],
   [[345, 100, 100], [40, 100, 100]],
   [[173, 100, 100], [244, 100, 100]],
   [[311, 100, 100], [193, 100, 100]],
   [[320, 100, 100], [60, 100, 100]]
]

let lightPaletteChoices = [
   [[0, 0, 2], [187, 84, 67]]
]
let saveButton;

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
   colorMode(HSB); // Switch to HSB color mode
   bgColor = random(bgChoices);
   // bgColor = bgChoices[2];
   console.log("bgColor:", bgColor);
   styleNums = [1, 2, 3, 4];
   style = random(styleNums);
   // style = 4;
   console.log("styleNum:", style);
   palette = shuffle(random(paletteChoices));
   color1 = palette[0];
   color2 = palette[1];
   console.log("color1:", color1);
   console.log("color2:", color2);
   numRect = random(1, 4);
   if (canvasHeight > canvasWidth) {
      for (let i = 0; i < numRect; i++) {
         isSquare = random() < .5;
         if (isSquare) {
            rectWidth[i] = random((canvasWidth - (2 * frameThickness))/8, (canvasWidth - (2 * frameThickness)) * (4/5));
            rectHeight[i] = rectWidth[i];
            console.log("rectWidth:", rectWidth[i]);
            console.log("rectHeight:", rectHeight[i]);
         } else {
            rectWidth[i] = random((canvasWidth - (2 * frameThickness))/8, (canvasWidth - (2 * frameThickness)) * (4/5));
            rectHeight[i] = random((canvasWidth - (2 * frameThickness))/8, (canvasWidth - (2 * frameThickness)) * (4/5));
         }
         rectX[i] = random(frameThickness + frameToRectPad, canvasWidth - rectWidth[i] - frameThickness - frameToRectPad);
         rectY[i] = random(frameThickness + frameToRectPad, canvasHeight - rectHeight[i] - frameThickness - frameToRectPad);
         rectBound[i] = random(10, 25);
         console.log("rectX:", rectX[i]);
         console.log("rectY:", rectY[i]);
         console.log("rectBound:", rectBound[i]);
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
   let currentSize = maxSize;
   let circleCounts = {}; // Track the number of circles for each size
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
            randomAngle: random(TWO_PI),
            crossHatch: PI/2,
            scribbles: []
         };
         if (style == 4) {
            calculateScribbles(newCircle);
         }
         if (!collides(newCircle)) {
            circles.push(newCircle);
            circleCounts[currentSize]++;
         }
         attempts++;
      }
      if (attempts >= attemptLimit || circleCounts[currentSize] >= maxCircles) {
         currentSize = currentSize * (sizeTier/denom); // Decrease the circle size
         sizeTier = sizeTier + 1;
         denom = sizeTier + 1;
      }
   }
   // // Create and position the save button
   // saveButton = createButton('Save as JPG');
   // saveButton.position(10, height / 2); // Adjust the position as needed
   // saveButton.mousePressed(saveArtwork); // Attach event listener
}

function saveArtwork() {
   saveCanvas(myCanvas, 'myArtwork', 'jpg'); // Save the canvas as 'myArtwork.jpg'
}

function centerCanvas() {
   let x = (windowWidth - width) / 2;
   let y = (windowHeight - height) / 2;
   myCanvas.position(x, y);
 }
 
//  function windowResized() {
//    centerCanvas();
//  }

function draw() {
   background(bgColor);
   translate(-width / 2, -height / 2); // Adjust for WEBGL's center origin

   if (style == 1) {
      parallelHatch();
   } else if (style == 2) {
      crossHatch();
   } else if (style == 3) {
      contourHatch();
   } else if (style ==4 ) {
      scribbleHatch();
   }
}

function parallelHatch() {
   for (let circle of circles) {
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

// function crossHatch() {
//    for (let circle of circles) {
//       let numLines = circle.r * 2; // Proportional to the radius
//       let lineSpacing = (circle.r * 2) / numLines;
//       // let randomAngle = random(TWO_PI); // Random rotation angle

//       push(); // Isolate transformations
//       translate(circle.x, circle.y); // Move to the circle's center
//       rotate(circle.randomAngle); // Apply rotation

//       if (isDark) {
//          // fillLight = 10;
//          // fill(color(hue(circle.color), fillLight, brightness(circle.color)));
//          // console.log("fillLight:", fillLight);
//          fill(0, 0, 20);
//       } else {
//          // fillDark = 10;
//          // fill(color(hue(circle.color), saturation(circle.color), fillDark));
//          // console.log("fillDark:", fillDark);
//          fill(0, 0, 80);
//       }
//       noStroke();
//       ellipse(0, 0, circle.r * 2, circle.r * 2);
//       stroke(circle.color); // Color of the hatching lines
//       strokeWeight(.25); // Thickness of the hatching lines

//       for (let i = 0; i <= numLines; i++) {
//          let y = -circle.r + i * lineSpacing;
//          let xDelta = sqrt(circle.r * circle.r - y * y);
//          line(-xDelta, y, xDelta, y);
//       }

//       rotate(circle.crossHatch); // Apply rotation

//       for (let j = 0; j <= numLines; j++) {
//          let y = -circle.r + j * lineSpacing;
//          let xDelta = sqrt(circle.r * circle.r - y * y);
//          line(-xDelta, y, xDelta, y);
//       }
      
//       pop(); // Revert transformations
//    }
// }

function crossHatch() {
   for (let circle of circles) {
      let numLines = circle.r * 1.5; // Proportional to the radius
      let lineSpacing = (circle.r * 2) / numLines;
      // let randomAngle = random(TWO_PI); // Random rotation angle

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
   for (let circle of circles) {
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
   for (let circle of circles) {
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

function stippleHatch() {

}

function zigZagHatch() {

}

function getRandomColor(position) {
   // Define the mean and standard deviation for the normal distribution
   let hueMean = lerp(color1[0], color2[0], position);
   let hueSD = 40; // Standard deviation
 
   // Generate a random hue value based on the normal distribution
   let hue = randomGaussian(hueMean, hueSD);
 
   // Keep the hue within the 0-360 range
   hue = (hue + 360) % 360;

   return color(hue, 100, 100);
}

function collides(circle) {
   for (let other of circles) {
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
