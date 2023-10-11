let sourceImg=null;
let maskImg=null;
let renderCounter=0;
let textImg=null;

// change these three lines as appropiate
let sourceFile = "input_2.jpg";
let maskFile   = "mask_2.png";
let outputFile = "output_1.png";

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
}

let X_STOP = 1920;
let Y_STOP = 1080;
//let OFFSET = 40;
let DIAMETER = 11;

function draw () {
  // make kernel
  is_reverse = true;
  is_diamond = true;
  let kernel = makePixelKernel(DIAMETER, is_reverse, is_diamond)

  let num_lines_to_draw = 40;
  // get one scanline
  for(let j=renderCounter; j<renderCounter+num_lines_to_draw && j<1080; j++) {
    for(let i=0; i<X_STOP; i++) {
      colorMode(RGB);
      let pix = sourceImg.get(i, j);
      // create a color from the values (always RGB)
      let col = color(pix);
      let tex = textImg.get(i, j);
      let mask = maskImg.get(i, j);

      if (mask[1] > 128) {

        // bokeh effect
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

        set(i, j, pix);
      }
      else {

        
        let offset = maskImg.get(i+100, j+100);
        let offset2 = maskImg.get(i-100, j-100);
        let offset3 = maskImg.get(i+100, j-100);
        let offset4 = maskImg.get(i-100, j+100);
        if (offset[1] > 128 || offset2[1] > 128 || offset3[1] > 128 || offset4[1] > 128){
          pix = [0, 0, 0, 255]; // draw black for now
          set(i, j, pix);
        }
        else {
          let new_col = [0, 0, 0, 255];
          for(let k=0; k<3; k++) {
            new_col[k] = map(40, 0, 100, pix[k], tex[k]);
          }
          
          set(i, j, new_col);
        }
        
      }

      
    }
  }
  renderCounter = renderCounter + num_lines_to_draw;
  updatePixels();

  // print(renderCounter);
  if(renderCounter > Y_STOP) {
    console.log("Done!")
    noLoop();
    // uncomment this to save the result
    // saveArtworkImage(outputFile);
  }
}

// return a custom pixel kernel with given diameter (should be odd). will return array[diameter][diameter]
function makePixelKernel(diameter, is_reverse=false, is_diamond=false) {
  let kernel = [];
  let on_value = 1;
  let off_value = 0;
  if (is_reverse) {
    on_value = 0;
    off_value = 1;
  }
  for (let j=0; j<diameter; j++) {
    let j_center = (diameter-1) / 2;
    let j_offset = abs(j_center-j);
    let j_frac = j_offset / j_center;
    let row = [];
    kernel.push(row);
    for (let i=0; i<diameter; i++) {
      let i_center = (diameter-1) / 2;
      let i_offset = abs(i_center-i);
      let i_frac = i_offset / i_center;
      if (is_diamond) {
        if (i_frac + j_frac > 1) {
          row.push(off_value);
        }
        else {
          row.push(on_value);
        }
      }
      else {
        if ((i_frac*i_frac + j_frac*j_frac) > 1) {
          row.push(off_value);
        }
        else {
          row.push(on_value);
        }
      }
    }
  }
  return kernel;
}


function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
}

/**
 *   angleMode(DEGREES);
  let num_lines_to_draw = 40;
  for(let j=renderCounter; j<renderCounter+num_lines_to_draw && j<Y_STOP; j++) {
    for(let i=0; i<X_STOP; i++) {
      let pix;
      colorMode(RGB);
      let mask = maskImg.get(i, j);
      
      if (mask[1] > 128) {
        pix = sourceImg.get(i, j);
        
        const c = color(pix);
        let redFilteredColor = color(red(c) + 100, green(c), blue(c));

        set(i, j, redFilteredColor);
      }
      else {
        let wave = sin(i*6);
        let slip = map(wave, -1, 1, -OFFSET, OFFSET);
        pix = sourceImg.get(i+slip, j);
        let maskWave = maskImg.get(i+slip, j);

        // don't want the mask to get wavy
        if (maskWave[1] > 128){
          pix = sourceImg.get(i, j);
        }

        const c = color(pix);
        let blueFilteredColor = color(red(c), green(c), blue(c) + 100);
        
        set(i, j, pix);
        set(i, j, blueFilteredColor);
      }

      
    }
  }
  renderCounter = renderCounter + num_lines_to_draw;
  updatePixels();

  if(renderCounter > Y_STOP) {

    // adding second layer of decorative shapes
    let change = true;
    for(let i=0;i<400;i++) {
      let x = floor(random(sourceImg.width));
      let y = floor(random(sourceImg.height));
      let pix = sourceImg.get(x, y);
      let mask = maskImg.get(x, y);
      const c = color(pix);
      let blueFilteredColor = color(red(c), green(c), blue(c) + 200);
      let redFilteredColor = color(red(c) + 100, green(c), blue(c));
      noStroke();

      let pointSize = 5;
      drawingContext.shadowBlur = 0;

      if (mask[0] < 128){
        if (change == true){
          fill(blueFilteredColor);
          drawingContext.shadowColor = blueFilteredColor;
          rect(x, y, 10, pointSize);
          change = false;
          console.log("b!")
        } else {
          fill(redFilteredColor);
          drawingContext.shadowColor = redFilteredColor;
          rect(x, y, 10, pointSize);
          change = true;
          console.log("r!")
        }
        
        
      }
      
      
    }


    console.log("Done!")
    noLoop();
    // uncomment this to save the result
    // saveArtworkImage(outputFile);
  }
 */