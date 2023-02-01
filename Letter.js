const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  //animate: true
};

//objekt pre tweakpane
const params = {
    cell: 20,
    message: 'YXHOUIWV',
    tvar: 'kruh',
    font: 'Calibri', 
    innerfont: 'Calibri', 
    amplitude: 0.2,
    frame: 0,
    animate: true,
    red: 255,
    green: 255,
    blue: 255,
};

//pre async
let manager;

let text = 'E';
let fontSize = 1200;


//bitmap canvas
const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {
  const cell = params.cell; //pixel size pre bitmap
  const cols = Math.floor(width / cell); //pre kazdých 20 pixelov v main canvas bude 1 pixel v typecanvas
  const rows = Math.floor(height / cell); 
  const numCell = cols * rows;

  typeCanvas.width = cols;
  typeCanvas.height = rows;

  return ({ context, width, height }) => {
    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);

    fontSize = cols * 1.1;

    typeContext.fillStyle = `rgb(${params.red}, ${params.green}, ${params.blue})`;
    typeContext.font = `${fontSize}px ${params.font}`;
    typeContext.textBaseline = 'top';
    
    //keďže ale písmeno má nejaku mieru, tak musime pozuit measureText
    const metrics = typeContext.measureText(text);
    console.log(metrics); //odtialto ziskame parametere

    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const tx = (cols - mw) * 0.5 - mx;
    const ty = (rows - mh) * 0.5 - my;
  
    typeContext.save();
    typeContext.translate(tx, ty);

    typeContext.beginPath();
    typeContext.rect(mx, my, mw, mh);
    typeContext.stroke();

    typeContext.fillText(text, 0, 0); 
    typeContext.restore();

    const typeData = typeContext.getImageData(0, 0, cols, rows).data; //experimentalna funkcia https://developer.mozilla.org/en-US/docs/Web/API/ImageData
    console.log(typeData); //vytvori velky array s rgba a xy hodnotami

    context.textBaseline = 'middle';
    context.textAlign = 'center';

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);


    //kreslime z kruhov
    const kruh = () => {
        context.beginPath();
        context.arc(0, 0, cell * 0.5, 0, Math.PI * 2);
        context.fill();
    };
    
    //kreslime z obdlznikov
    const rect = () => {
        context.fillRect(0, 0, cell, cell);
    }


    
    //tymto loopom v podstate kreslime nase pismeno z 20px (cell premenna) kociek
    for (i = 0; i < numCell; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4 + 0]; // pixel index je i, 4 = rgba, +0 znamena explicitne napisane aby sme vedeli, že red je index 0
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];

      // podla sily textu kreslime rozne veci
      const glyph = getGlyph(r); //kedže kreslime z bielej je jedno ktory rgb kanal pouzijeme

      context.font = `${cell * 2}px ${params.innerfont}`;
      if (Math.random() < 0.1) context.font = `${cell * 6}px ${params.innerfont}`;

      context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      
      //vytvori cierny obraz z 54*54 veci (1080 / 20)
      context.save();
      context.translate(x, y);
      context.translate(cell * 0.5, cell * 0.5);
 
      
      //funkcia, ktora urcuje akym typom vykreslujeme pismeno
      switch (params.tvar) {
        case 'kruh':
            kruh();
          break;
        case 'rect':
            rect();
          break;
        case 'pismenka':
            context.fillText(glyph, 0, 0);       
      };
      

      context.restore();
    }
  };
};

//rozne symboly na zaklade brightness 
const getGlyph = (v) => {
  if (v < 50) return '-';
  if (v < 100) return '_';
  if (v < 150) return '+';
  if (v < 200) return '|';

  //const glyphs = 'abcdefgh'.split('');
  const glyphs = `${params.message}`.split('');

  return (random.pick(glyphs));
};

const onKeyUp = (e) => {
  text = e.key.toUpperCase();
  manager.render();
};

document.addEventListener('keyup', onKeyUp);

//ovladaci panel
const createPane = () => {
    const pane = new tweakpane.Pane();
    let folder;

    folder = pane.addFolder({ title: 'Grid'});
    folder.addInput(params, 'message');
    folder.addInput(params, 'font', 
        {options: {
          Calibri: 'Calibri',
          ComicSans: 'Comic Sans MS',
          CooperStd: 'Cooper Std',
          Arial: 'Arial',
          Rosewood: 'ROSEWOODSTD-REGULAR.OTF',
          Verdana: 'Verdana',
          Webdings: 'Webdings',
          Wingdings: 'Wingdings'
        }});
    folder.addInput(params, 'innerfont', 
        {options: {
          Calibri: 'Calibri',
          ComicSans: 'Comic Sans MS',
          CooperStd: 'Cooper Std',
          Arial: 'Arial',
          Rosewood: 'ROSEWOODSTD-REGULAR.OTF',
          Verdana: 'Verdana',
          Webdings: 'Webdings',
          Wingdings: 'Wingdings'
        }});
    folder.addInput(params, 'tvar', 
        {options: {
          kruh: 'kruh',
          obdlznik: 'rect',
          pismenka: 'pismenka',
        }});

    folder = pane.addFolder({ title: 'Noise'});    
    folder.addInput(params, 'animate');


    folder = pane.addFolder({ title: 'Colour'});
    folder.addInput(params, 'red', { min: 0, max: 255, step: 1});
    folder.addInput(params, 'green', { min: 0, max: 255, step: 1});
    folder.addInput(params, 'blue', { min: 0, max: 255, step: 1});
};

//async funkcia, ktora caka na stlacenie klavesu
const start = async() => {
  manager = await createPane();
  manager = await canvasSketch(sketch, settings);
 
};
start();

