const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  //animate:true //uncomment if you want fast blinking nonsense
};


// vypocet rotacie zo stupnov(degree) na radiany - napr. 45(stupnov) / 180 * math.PI - nahradene funkciou degToRad
const stupnoradian = (degrees) => {
  return degrees / 180 * Math.PI;
}

const randomRange = (min, max) => {
  return Math.random() * (max - min) + min;
}


const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'SlateGray';
    context.fillRect(0, 0, width, height);
  
    context.fillStyle = 'DarkSlateGrey';

    const cx = width * 0.5; //stred kruhu
    const cy = height * 0.5;
    const w = width * 0.01;
    const h = height * 0.1;
    let x, y;

    const num = 24; 
    const radius = width * 0.3;

    
    for (let i = 0; i < num; i++) {
      const slice = math.degToRad(360 / num); //funkcia z canvas-sketch-util/math
      const angle = slice * i;

      //help - https://ramesaliyev.com/trigonoparty/
      x = cx + radius * Math.sin(angle);
      y = cy + radius * Math.cos(angle);

      context.save();
	    context.translate(x, y);
	    context.rotate(-angle); 
	    context.scale(random.range(0.6, 2.2), random.range(0.3, 0.5)); //1 je default state
	    
	    context.beginPath();
	    context.rect(-w * 0.5, random.range(0, -h * 0.5), w , h);
	    context.fill();
      context.restore();
	
      context.save();
      context.translate(cx, cy) //translate to the center of the circle
      context.rotate(-angle); 

      context.lineWidth = random.range(5, 20);

      context.beginPath();
      context.strokeStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
      context.arc(0, 0, radius * randomRange(0.5 , 1.2), slice * randomRange(1, -5), slice * randomRange(1, 7)); //slice je jeden radian, tym, ze s nim manipulujeme vieme robit necely kruh
      context.stroke();
      context.restore();
    }

  };
};


canvasSketch(sketch, settings);
