const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

//objekt pre tweakpane
const params = {
    cols: 10,
    rows: 10,
    scaleMin: 1,
    scaleMax: 30,
    freq: 0.001,
    amplitude: 0.2,
    frame: 0,
    animate: true,
    lineCap: 'butt',
    red: 0,
    green: 0,
    blue: 0,
    background: {r: 255, g: 255, b: 255},
    tint: {r: 0, g: 0, b: 0, a: 1},
}

const sketch = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const cols = params.cols;
    const rows = params.rows;
    const numCells = cols * rows;

    // premenne pre GRID
    const gridw = width * 0.8;
    const gridh = height * 0.8;
    const cellw = gridw / cols;
    const cellh = gridh / rows;
    //margins
    const margx = (width - gridw) * 0.5;
    const margy = (height - gridh) * 0.5;

    
    // const col pouziva mod - a tym ako iterujeme for loopom, su tam len iste zvyskove hodnoty (pri cols 4 su zvysky len 0 az 3)
    // const row pouziva zaokuhlovanie nadol, cim ziskame to, ze kazde 4 kroky (v tomto pripade) sa hodnota row zvysi o jedna
    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cellw;
      const y = row * cellh;
      const w = cellw * 0.8;
      const h = cellh * 0.8;

      //animation frames
      const f = params.animate ? frame: params.frame;

      //noise generation
      const n = random.noise3D(x, y, f * 30, params.freq);
      
      const angle = n * Math.PI * params.amplitude; //premeni n na -180 az 180 stupnov
      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax); 

      //kreslenie
      context.save();
      context.translate(x, y);
      context.translate(margx, margy);
      context.translate(cellw * 0.5, cellh * 0.5);
      context.rotate(angle);

      context.lineWidth = scale;
      context.lineCap = params.lineCap;
      context.strokeStyle = `rgb(${params.red}, ${params.green}, ${params.blue})`;
      
      context.beginPath();
      context.moveTo(w * -0.5, 0);
      context.lineTo(w * 0.5, 0);
      context.stroke();
      context.restore();

    }
  

  };
};

//modulacny panel
const createPane = () => {
    const pane = new tweakpane.Pane();
    let folder;

    folder = pane.addFolder({ title: 'Grid'});
    folder.addInput(params, 'lineCap', { options: { butt: 'butt', round: 'round', square: 'square'}});
    folder.addInput(params, 'cols', { min: 2, max: 50, step: 1});
    folder.addInput(params, 'rows', { min: 2, max: 50, step: 1});
    folder.addInput(params, 'scaleMin', { min: 1, max: 100});
    folder.addInput(params, 'scaleMax', { min: 1, max: 100});

    folder = pane.addFolder({ title: 'Noise'});    
    folder.addInput(params, 'freq', { min: -0.01, max: 0.01});
    folder.addInput(params, 'amplitude', { min: 0, max: 1});
    folder.addInput(params, 'animate');
    folder.addInput(params, 'frame', { min: 0, max: 999});

    folder = pane.addFolder({ title: 'Color'});
    folder.addInput(params, 'red', { min: 0, max: 255, step: 1});
    folder.addInput(params, 'green', { min: 0, max: 255, step: 1});
    folder.addInput(params, 'blue', { min: 0, max: 255, step: 1});

};

createPane();
canvasSketch(sketch, settings);
