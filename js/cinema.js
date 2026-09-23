/* Procedural ribbon tunnel, projected in 3D onto Canvas2D. No assets or libraries. */
(function () {
  'use strict';
  var section = document.querySelector('.worlds');
  if (!section) return;
  var canvas = section.querySelector('canvas');
  var ctx = canvas && canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  var cards = Array.from(section.querySelectorAll('.direction-card'));
  var buttons = Array.from(section.querySelectorAll('[data-chapter]'));
  var counter = section.querySelector('[data-cinema-count]');
  var media = matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine)');
  var palette = [[255,90,106],[155,107,255],[95,208,240],[75,224,160]];
  var enabled = false, frame = 0, width = 0, height = 0, progress = 0;
  var clamp = function (n,a,b) { return Math.max(a,Math.min(b,n)); };
  function size() {
    width = section.clientWidth; height = innerHeight;
    var dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  // Camera moves down the helix while its roll and look direction follow the scroll.
  function project(x,y,z,p) {
    var roll = -.22 + p*.48;
    var rx = x*Math.cos(roll)-y*Math.sin(roll);
    var ry = x*Math.sin(roll)+y*Math.cos(roll);
    var f = Math.min(width,height)*.9;
    var scale = f / (z+900);
    return [width*(.5+.13*Math.sin(p*Math.PI*2))+rx*scale, height*.47+ry*scale, scale];
  }
  function draw(p) {
    ctx.fillStyle='#08080a'; ctx.fillRect(0,0,width,height);
    var chapter = Math.min(3,Math.floor(p*4));
    var next = Math.min(3,chapter+1), mix = clamp(p*4-chapter,0,1);
    var rgb=palette[chapter].map(function(v,i){return Math.round(v+(palette[next][i]-v)*mix);});
    var glow=ctx.createRadialGradient(width*.6,height*.45,0,width*.6,height*.45,width*.55);
    glow.addColorStop(0,'rgba('+rgb.join(',')+',0.14)'); glow.addColorStop(1,'rgba(8,8,10,0)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    // Far-to-near polygons give the ribbons a solid reflective surface, not a particle cloud.
    var quads=[];
    for(var ribbon=0;ribbon<4;ribbon++) {
      for(var j=0;j<90;j++) {
        var z=3000-j*38;
        var points=[];
        for(var corner=0;corner<4;corner++) {
          var zz=z+(corner<2?0:-38);
          var edge=(corner===0||corner===3)?-1:1;
          var angle=zz*.0031+ribbon*Math.PI/2+p*Math.PI*3.1;
          var radius=480+80*Math.sin(zz*.0015+p*4);
          var half=.105+.035*Math.sin(zz*.002);
          var a=angle+edge*half;
          points.push(project(Math.cos(a)*radius,Math.sin(a)*radius*.73,zz,p));
        }
        var shine=.5+.5*Math.cos(z*.0031+ribbon*Math.PI/2+p*9);
        quads.push({z:z,points:points,shine:shine,ribbon:ribbon});
      }
    }
    quads.sort(function(a,b){return b.z-a.z;});
    quads.forEach(function(q){
      var light=.06+Math.pow(q.shine,7)*.52;
      var c=rgb.map(function(v){return Math.round(19+v*light);});
      ctx.beginPath();q.points.forEach(function(v,i){if(i===0)ctx.moveTo(v[0],v[1]);else ctx.lineTo(v[0],v[1]);});ctx.closePath();
      ctx.fillStyle='rgb('+c.join(',')+')';ctx.fill();
      ctx.strokeStyle='rgba('+rgb.join(',')+','+(.08+q.shine*.16)+')';ctx.lineWidth=.6;ctx.stroke();
    });
    // Fine luminous trajectories trace the same spatial volume.
    for(var line=0;line<12;line++){
      ctx.beginPath();
      for(var k=0;k<105;k++){
        var zz=3300-k*35;
        var a=zz*.0031+line*Math.PI/6+p*Math.PI*3.1;
        var r=570+45*Math.sin(zz*.002+line);
        var v=project(Math.cos(a)*r,Math.sin(a)*r*.73,zz,p);
        if(k===0)ctx.moveTo(v[0],v[1]);else ctx.lineTo(v[0],v[1]);
      }
      ctx.strokeStyle='rgba('+rgb.join(',')+',0.16)';ctx.lineWidth=.7;ctx.stroke();
    }
  }
  function render() {
    frame=0;if(!enabled||document.hidden)return;
    var rect=section.getBoundingClientRect();
    if(rect.top>innerHeight||rect.bottom<0)return;
    progress=clamp(-rect.top/(section.offsetHeight-innerHeight),0,1);
    var position=progress*3.6-.3;
    var active=clamp(Math.round(position),0,3);
    cards.forEach(function(card,i){
      var delta=i-position;
      var amount=Math.abs(delta);
      var opacity=clamp(1-(amount-.28)*1.65,0,1);
      var x=delta*width*.56;
      var y=delta*height*.16;
      var z=-amount*700;
      card.style.transform='translate(-50%,-50%) translate3d('+x+'px,'+y+'px,'+z+'px) rotateY('+(-delta*28)+'deg) rotateZ('+(delta*7)+'deg)';
      card.style.opacity=opacity.toFixed(3);
      card.style.visibility=opacity<.02?'hidden':'visible';
      card.style.pointerEvents=i===active?'auto':'none';
      card.style.zIndex=String(10-Math.round(amount*3));
      card.tabIndex=i===active?0:-1;
      card.setAttribute('aria-hidden',i===active?'false':'true');
    });
    buttons.forEach(function(b,i){if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    counter.textContent='0'+(active+1);
    section.style.setProperty('--scene-progress',progress);
    section.style.setProperty('--scene-color','rgb('+palette[active].join(',')+')');
    draw(progress);
  }
  function request(){if(enabled&&!frame&&!document.hidden)frame=requestAnimationFrame(render);}
  function sync(){
    var next=media.matches&&document.body.getAttribute('data-effects')==='on';
    if(next===enabled){request();return;}
    var rect=section.getBoundingClientRect();
    var inside=rect.top<0&&rect.bottom>innerHeight;
    var oldTop=rect.top+scrollY;
    enabled=next;section.classList.toggle('is-cinema',enabled);
    cancelAnimationFrame(frame);frame=0;
    if(enabled){size();request();}
    else {
      cards.forEach(function(card){card.removeAttribute('style');card.removeAttribute('tabindex');card.removeAttribute('aria-hidden');});
      section.style.removeProperty('--scene-progress');section.style.removeProperty('--scene-color');
      if(inside)window.scrollTo({top:oldTop,behavior:'instant'});
    }
  }
  buttons.forEach(function(button,i){button.addEventListener('click',function(){
    if(!enabled)return;
    var target=(i+.3)/3.6;
    scrollTo({top:section.getBoundingClientRect().top+scrollY+target*(section.offsetHeight-innerHeight),behavior:'smooth'});
  });});
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',function(){if(enabled)size();sync();},{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else request();});
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-effects']});
  if(media.addEventListener)media.addEventListener('change',sync);else media.addListener(sync);
  sync();
}());

