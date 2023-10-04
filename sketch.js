let sourceImg=null;
let maskImg=null;
let renderCounter=0;

// change these three lines as appropiate
let sourceFile = "input_4.jpg";
let maskFile   = "mask_4.png";
let outputFile = "output_1.png";

function preload() {
  sourceImg = loadImage(sourceFile);
  maskImg = loadImage(maskFile);
}

function setup () {
  let main_canvas = createCanvas(1080, 1440);
  main_canvas.parent('canvasContainer');

  imageMode(CENTER);
  noStroke();
  background(0, 0, 0);
  sourceImg.loadPixels();
  maskImg.loadPixels();
}
let X_STOP = 1080;
let Y_STOP = 1440;
let OFFSET = 40;

function draw () {
  angleMode(DEGREES);
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
}

function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
}
