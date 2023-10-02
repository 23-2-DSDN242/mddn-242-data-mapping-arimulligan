let sourceImg=null;
let maskImg=null;
let renderCounter=0;

// change these three lines as appropiate
let sourceFile = "input_2.jpg";
let maskFile   = "mask_2.png";
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
      let x = floor(random(sourceImg.width));
      let y = floor(random(sourceImg.height));
      let pix;
      colorMode(RGB);
      let mask = maskImg.get(i, j);
      
      if (mask[1] > 128) {
        pix = sourceImg.get(i, j);
        set(i, j, pix);

        const c = color(pix);
        let redFilteredColor = color(red(c) + 100, green(c), blue(c));
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = redFilteredColor;
        stroke(redFilteredColor);
        let pointSize = 2;
      
        // for (let j =0; j< 50; j++){
        //   rect(x+j, y, 10, pointSize);
        // }
        
      }
      else {
        let wave = sin(i*4);
        let slip = map(wave, -1, 1, -OFFSET, OFFSET);
        pix = sourceImg.get(i+slip, j);
        let maskWave = maskImg.get(i+slip, j);

        // don't want the mask to get wavy
        if (maskWave[1] > 128){
          pix = sourceImg.get(i, j);
        }

        drawingContext.shadowBlur = 0;
        const c = color(pix);
        let blueFilteredColor = color(red(c), green(c), blue(c) + 100);
        stroke(blueFilteredColor);
        strokeWeight(3);
        //line(x, y, x+pointSize, y);
        

        // let brt = map(wave, -1, 1, 0, 255);
        // for(let c=0; c<3; c++) {
        //   pix[c] = brt;
        // }
        set(i, j, pix);
      }

      
    }
  }
  renderCounter = renderCounter + num_lines_to_draw;
  updatePixels();
  // for(let i=0;i<4000;i++) {
  //   let x = floor(random(sourceImg.width));
  //   let y = floor(random(sourceImg.height));
  //   let pix = sourceImg.get(x, y);
  //   let mask = maskImg.get(x, y);

  //   const c = color(pix);
  //   let blueFilteredColor = color(red(c), green(c), blue(c) + 100);
  //   let redFilteredColor = color(red(c) + 100, green(c), blue(c));

  //   if(mask[0] > 128) {
  //     drawingContext.shadowBlur = 20;
  //     drawingContext.shadowColor = redFilteredColor;
  //     stroke(redFilteredColor);
  //     let pointSize = 2;
      
  //     for (let j =0; j< 50; j++){
  //       rect(x+j, y, 10, pointSize);
  //     }
      
  //   }
  //   else {
  //     drawingContext.shadowBlur = 0;
  //     stroke(blueFilteredColor);
  //     let pointSize = 10;
  //     strokeWeight(3);
  //     line(x, y, x+pointSize, y);
  //   }
  // }
  // renderCounter = renderCounter + 1;
  if(renderCounter > Y_STOP) {
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
