/* Row slices allow parameter changes/cancellation between chunks. */
importScripts('fractal.js');
let generation=0;
self.onmessage=e=>{
 const req=e.data,id=++generation;let y=0;
 function tick(){if(id!==generation)return;try{const rows=Math.min(6,req.height-y),pixels=new Uint8ClampedArray(req.width*rows*4);for(let j=0;j<rows;j++)for(let x=0;x<req.width;x++){const p=FractalCore.pixel(req.view,x,y+j,req.width,req.height),result=FractalCore.escape(p.x,p.y,req.iterations,req.view.mode,req.view.cr,req.view.ci),rgb=FractalCore.color(result,req.palette),i=(j*req.width+x)*4;pixels.set(rgb,i);pixels[i+3]=255;}self.postMessage({id:req.id,width:req.width,rows,y,pixels:pixels.buffer,progress:(y+rows)/req.height,done:y+rows===req.height},[pixels.buffer]);y+=rows;if(y<req.height)setTimeout(tick,0);}catch(error){self.postMessage({id:req.id,error:String(error)});}}
 tick();
};
