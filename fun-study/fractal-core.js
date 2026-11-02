/* Independent escape-time fractal explorer. Doubles, finite iteration budget. */
(function(root){
'use strict';
function escape(x,y,limit=700,mode='mandelbrot',cr=0,ci=0){
 let zx=mode==='julia'?x:0,zy=mode==='julia'?y:0;
 if(mode!=='julia'){
  cr=x;ci=y;const q=(x-.25)**2+y*y;
  if(q*(q+x-.25)<=.25*y*y||(x+1)**2+y*y<=.0625)return{escaped:false,n:limit,smooth:limit};
 }
 const radius2=Math.max(4,cr*cr+ci*ci);
 for(let n=1;n<=limit;n++){const next=zx*zx-zy*zy+cr;zy=2*zx*zy+ci;zx=next;const r2=zx*zx+zy*zy;if(r2>radius2)return{escaped:true,n,smooth:n+1-Math.log2(Math.log(Math.sqrt(r2)))};}
 return{escaped:false,n:limit,smooth:limit};
}
function pixel(view,x,y,width,height){return{x:view.x+((x+.5)/width-.5)*view.span,y:view.y+(.5-(y+.5)/height)*view.span*height/width};}
function point(view,fx,fy,aspect){return{x:view.x+(fx-.5)*view.span,y:view.y+(.5-fy)*view.span/aspect};}
const MIN_SPAN=3.4e-10,MAX_SPAN=16;
function zoom(view,factor,fx=.5,fy=.5,aspect=1.5){const anchor=point(view,fx,fy,aspect),span=Math.max(MIN_SPAN,Math.min(MAX_SPAN,view.span/factor));return{...view,span,x:anchor.x-(fx-.5)*span,y:anchor.y-(.5-fy)*span/aspect};}
function color(result,palette='jewel'){
 if(!result.escaped)return[8,13,27];
 const t=result.smooth*.024;
 const palettes={jewel:[[.51,.47,.5],[.49,.47,.48],[1,1,1],[.02,.19,.40]],ocean:[[.44,.54,.58],[.38,.42,.40],[1,1,1],[.42,.23,.10]],fire:[[.58,.40,.25],[.42,.38,.25],[1,1,1],[0,.12,.25]]};
 const [a,b,c,d]=palettes[palette]||palettes.jewel;return a.map((v,i)=>Math.round(255*Math.max(0,Math.min(1,v+b[i]*Math.cos(2*Math.PI*(c[i]*t+d[i]))))));
}
const api={escape,pixel,point,zoom,color,MIN_SPAN,MAX_SPAN};if(typeof module!=='undefined')module.exports=api;else root.FractalCore=api;


})(globalThis);
