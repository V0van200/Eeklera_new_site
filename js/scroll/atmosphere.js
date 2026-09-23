(function(api){
  'use strict';
  api.Atmosphere=function(){
    var canvas=document.createElement('canvas');canvas.className='story-atmosphere';canvas.setAttribute('aria-hidden','true');document.body.appendChild(canvas);
    var ctx=canvas.getContext('2d'),w=0,h=0;
    this.available=!!ctx;
    this.resize=function(){w=innerWidth;h=innerHeight;var d=Math.min(devicePixelRatio||1,1.25);canvas.width=w*d;canvas.height=h*d;if(ctx)ctx.setTransform(d,0,0,d,0,0);};
    this.render=function(scene,progress,strength,scroll){
      if(!ctx)return;ctx.clearRect(0,0,w,h);if(strength<.005)return;
      var color=scene===2?'128,91,59':scene===1?'166,116,231':'105,197,212';
      ctx.globalAlpha=strength;
      // A moving slit of light sweeps at the boundary rather than flashing the whole screen.
      var x=w*(1-progress),glow=ctx.createLinearGradient(x-150,0,x+150,0);
      glow.addColorStop(0,'rgba('+color+',0)');glow.addColorStop(.48,'rgba('+color+',0.055)');glow.addColorStop(.5,'rgba('+color+',0.2)');glow.addColorStop(.54,'rgba('+color+',0.07)');glow.addColorStop(1,'rgba('+color+',0)');
      ctx.fillStyle=glow;ctx.fillRect(x-150,0,300,h);
      // Project deterministic fragments through a gently rolling camera; nothing loops at rest.
      for(var i=0;i<62;i++){
        var seed=(Math.sin(i*127.1+3)*43758.5453)%1;
        var z=((i*97+scroll*.36)%1900+1900)%1900+220;
        var scale=650/z;
        var angle=i*2.399+scroll*.00019;
        var px=w*.5+Math.cos(angle)*(w*.55+seed*80)*scale;
        var py=h*.5+Math.sin(angle)*h*.5*scale;
        var size=(1+Math.abs(seed)*5)*scale;
        ctx.save();ctx.translate(px,py);ctx.rotate(angle+progress);
        ctx.strokeStyle='rgba('+color+','+Math.min(.4,.1*scale)+')';ctx.fillStyle='rgba('+color+',0.035)';
        if(scene===2){ctx.beginPath();ctx.moveTo(-size*3,0);ctx.lineTo(size,-size*5);ctx.lineTo(size*2,size*2);ctx.closePath();ctx.fill();ctx.stroke();}
        else {ctx.beginPath();ctx.moveTo(-size,0);ctx.quadraticCurveTo(0,-size*2,size,0);ctx.stroke();}
        ctx.restore();
      }
      // Fine film trajectories link the hero, music, portrait and contact scenes.
      for(var ribbon=0;ribbon<3;ribbon++){
        ctx.beginPath();
        for(var k=0;k<=80;k++){
          var u=k/80,xx=u*w,yy=h*(.5+.22*Math.sin(u*5+progress*4+ribbon*.23));
          yy+=Math.sin(u*11+progress*6)*26;
          if(!k)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
        }
        ctx.strokeStyle='rgba('+color+','+(.055+ribbon*.025)+')';ctx.lineWidth=1;ctx.stroke();
      }
      ctx.globalAlpha=1;
    };
    this.dispose=function(){canvas.width=canvas.height=0;canvas.remove();};
    this.resize();
  };
}(window.EekleraStory));
