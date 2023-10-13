let sourceImg=null;
let maskImg=null;
let renderCounter=0;
let textImg=null;
let spirals = [];
let X_STOP = 1920;
let Y_STOP = 1080;
let DIAMETER = 11;

// change these three lines as appropiate
let sourceFile = "input_7.jpg";
let maskFile   = "mask_7.png";
let outputFile = "output_7.png";

function preload() {
  sourceImg = loadImage(sourceFile);
  maskImg = loadImage(maskFile);
  textImg = loadImage("texture.png");
}

function setup () {
  let main_canvas = createCanvas(1920, 1080);
  main_canvas.parent('canvasContainer');

  imageMode(CENTER);
  noStroke();
  background(0, 0, 0);
  sourceImg.loadPixels();
  maskImg.loadPixels();
  textImg.loadPixels();

  // Create a heaps of random swirls and store their information
  for (let i = 0; i < 4000; i++) {
    let x = random(X_STOP);
    let y = random(Y_STOP);
    let startAngle = random(TWO_PI);
    let endAngle = startAngle + random(PI, TWO_PI);
    let numSwirls = random(0.05, 0.2);
    let spiral = {
      x,
      y,
      startAngle,
      endAngle,
      numSwirls
    };
    spirals.push(spiral);
  }
}

function draw () {
  // make kernel
  is_reverse = true;
  is_diamond = true;
  let kernel = blurKernel(DIAMETER)

  let num_lines_to_draw = 40;
  // get one scanline
  for(let j=renderCounter; j<renderCounter+num_lines_to_draw && j<1080; j++) {
    for(let i=0; i<X_STOP; i++) {
      colorMode(RGB);
      let pix = sourceImg.get(i, j);
      let tex = textImg.get(i, j);
      let mask = maskImg.get(i, j);

      if (mask[1] > 128) {

        // bokeh-type effect for the people in the mask
        let sum_rgb = [0, 0, 0]
        let num_cells = 0;
        for(let wx=0;wx<DIAMETER;wx++){
          for (let wy=0;wy<DIAMETER;wy++) {
            let kernel_value = kernel[wx][wy];
            if (kernel_value > 0) {
              pix = sourceImg.get(i+wx, j+wy);
              for(let c=0; c<3; c++) {
                sum_rgb[c] += pix[c];
              }
              num_cells += 1;
            }
          }
        }
        for(let c=0; c<3; c++) {
          pix[c] = int(sum_rgb[c] / num_cells);
        }
        let c = color(pix);
        // more of a redish colour
        let lessWarmColor = applyFilter(c, 90, 20, 30);

        set(i, j, lessWarmColor);
      }
      else {

        // to get surrounding area in all directions
        let offset = maskImg.get(i+100, j+100);
        let offset2 = maskImg.get(i-100, j-100);
        let offset3 = maskImg.get(i+100, j-100);
        let offset4 = maskImg.get(i-100, j+100);
        // this is for the surrounding area around the people mask
        if (offset[1] > 128 || offset2[1] > 128 || offset3[1] > 128 || offset4[1] > 128){
          let c = color(pix);
          let warmColor = applyFilter(c, 100, 50, 20);

          set(i, j, warmColor);
        }
        else {
          let new_col = [0, 0, 0, 255];
          for(let k=0; k<4; k++) {
            // reduce alpha value of the texture image
            new_col[k] = map(10, 0, 100, pix[k], tex[k]);
          }
          // for the background - make it more greeny cause backgrounds are all nature
          let final_col = applyFilter(new_col, 0, 10, 20);
          set(i, j, final_col);
        }
        
      }

      
    }
  }
  renderCounter = renderCounter + num_lines_to_draw;
  updatePixels();

  if(renderCounter > Y_STOP) {

    // adding second layer for the people - the swirls
    noFill();
    for (let i = 0; i < spirals.length; i++) {
      let { x, y, startAngle, endAngle, numSwirls } = spirals[i];

      let pix = sourceImg.get(x, y);
      let mask = maskImg.get(x, y);
    
      if (mask[1] > 128){
        // create a color exactly like the people
        let col = applyFilter(color(pix), 90, 20, 30);;
        stroke(col);
        // Draw a spiral using curveVertex
        let numPoints = 100;
        let angleIncrement = (endAngle - startAngle) / numPoints;
        let radius = 10;
        beginShape();
        for (let j = 0; j < numPoints; j++) {
          let currentAngle = startAngle + j * angleIncrement;
          let xOffset = cos(currentAngle) * radius;
          let yOffset = sin(currentAngle) * radius;
          curveVertex(x + xOffset, y + yOffset);
          radius += 0.2; // Increase the radius to create the spiral effect
          startAngle += numSwirls; // Rotate the spiral for a thicker spiral
        }
        endShape();
      }
    }

    console.log("Done!")
    noLoop();
    // uncomment this to save the result
    saveArtworkImage(outputFile);
  }
}

/**
 * Inspired from Tom Whites makePixelKernel code, but tried to do it in a triangular shape,
 * with the help of ChatGBT. Still just blurs it.
 * @param {*} diameter how blurred do you want it to be?
 * @returns an array of kernel pixel values.
 */
function blurKernel(diameter) {
  let kernel = [];
  for (let j = 0; j < diameter; j++) {
    let j_center = (diameter - 1) / 2;
    let j_offset = Math.abs(j_center - j);
    let row = [];
    kernel.push(row);
    for (let i = 0; i < diameter; i++) {
      let i_center = (diameter - 1) / 2;
      let i_offset = Math.abs(i_center - i);

      // Calculate the triangular shape: The pixel is on if i_offset + j_offset < diameter / 2
      if (i_offset + j_offset < diameter / 2) {
        row.push(1);
      } else {
        row.push(0);
      }
    }
  }
  return kernel;
}

/**
 * Creates a new color from the received one, according to the RGB values you give it.
 * Applies a filter to it.
 * @param {} c the colour you want to change
 * @param {*} addRed the amount of red you want to add
 * @param {*} addGreen the amount of green you want to add
 * @param {*} minBlue the amount of rblueed you want to take away
 * @returns a new filtered colour
 */
function applyFilter(c, addRed, addGreen, minBlue) {
  // extract RGB from original colour
  let r = red(c);
  let g = green(c);
  let b = blue(c);

  r = min(255, r + addRed);
  g = min(255, g + addGreen);
  b = max(0, b - minBlue);

  return color(r, g, b);
}


function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
}