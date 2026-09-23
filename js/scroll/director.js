(function(api){
  'use strict';
  var selectors=['.stage','.release','.about','#contacts','.site-footer'];
  var scenes=selectors.map(function(s){return document.querySelector(s);}).filter(Boolean);
  var enabled=false,frame=0,typography,atmosphere,floating;
  var desktop=matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine)');
  var clamp=function(n){return Math.max(0,Math.min(1,n));};
  var headings=scenes.map(function(s){return s.querySelector('h1,h2');}).filter(Boolean);
  var words=['SAME GIRL','SOUNDTRACK','ONE ROLE?','LET’S TALK','EEKLERA'];
  // Editorial words only; no invented quotes or biographical claims.
  words[2]='DIFFERENT WORLDS';
  function render(){
    frame=0;if(!enabled||document.hidden)return;
    var best=-1,bestWeight=0,bestProgress=0;
    scenes.forEach(function(scene,i){
      var r=scene.getBoundingClientRect(),height=innerHeight;
      var entry=clamp((height-r.top)/(height*.7));
      var phase=clamp((height-r.top)/(height+r.height));
      var exit=clamp(-r.top/Math.max(r.height,1));
      var visible=r.top<height&&r.bottom>0;
      scene.style.setProperty('--story-travel',String(phase));
      scene.style.setProperty('--story-entry',String(entry));
      if(!visible)return;
      var heading=scene.querySelector('h1,h2');
      if(heading)typography.render(heading,i===0?1:entry,exit);
      var weight=Math.sin(phase*Math.PI);
      // Keep the existing four-world sequence uncluttered.
      if(weight>bestWeight){best=i;bestWeight=weight;bestProgress=phase;}
      if(i===0){scene.style.setProperty('--story-zoom',String(1+exit*.2));scene.style.setProperty('--story-copy-y',(-exit*110)+'px');}
      else if(i===1){scene.style.setProperty('--story-art-rotation',(-18+phase*35)+'deg');scene.style.setProperty('--story-art-x',(-35+phase*70)+'px');}
      else if(i===2){scene.style.setProperty('--story-photo-y',((.5-phase)*100)+'px');scene.style.setProperty('--story-photo-angle',(-7+phase*14)+'deg');}
    });
    if(best<0){floating.style.opacity='0';atmosphere.render(0,0,0,scrollY);return;}
    floating.textContent=words[best];
    floating.classList.toggle('story-floating--ink',best===2);
    floating.style.opacity=String(bestWeight*.12);
    floating.style.transform='translate3d('+((.5-bestProgress)*28)+'vw,'+((.5-bestProgress)*22)+'vh,0) scale('+(1+bestProgress*.5)+') rotate('+(-8+bestProgress*12)+'deg)';
    var boundary=Math.pow(Math.abs(bestProgress-.5)*2,2);
    atmosphere.render(best,bestProgress,bestWeight*(.3+boundary*.5),scrollY);
  }
  function request(){if(enabled&&!frame&&!document.hidden)frame=requestAnimationFrame(render);}
  function sync(){
    var next=desktop.matches&&document.body.dataset.effects==='on';
    if(next===enabled){request();return;}
    enabled=next;
    if(enabled){
      typography=new api.Typography(headings);atmosphere=new api.Atmosphere();
      floating=document.createElement('div');floating.className='story-floating';floating.setAttribute('aria-hidden','true');document.body.appendChild(floating);
      document.body.classList.add('story-mode');render();
    }else{
      cancelAnimationFrame(frame);frame=0;document.body.classList.remove('story-mode');
      if(typography)typography.dispose();if(atmosphere)atmosphere.dispose();if(floating)floating.remove();
      scenes.forEach(function(s){['--story-travel','--story-entry','--story-zoom','--story-copy-y','--story-art-rotation','--story-art-x','--story-photo-y','--story-photo-angle'].forEach(function(k){s.style.removeProperty(k);});});
    }
  }
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',function(){sync();if(enabled)atmosphere.resize();request();},{passive:true});
  addEventListener('pageshow',function(){sync();request();});
  document.addEventListener('visibilitychange',function(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else request();});
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-effects']});
  if(desktop.addEventListener)desktop.addEventListener('change',sync);else desktop.addListener(sync);
  document.fonts.ready.then(request);sync();
}(window.EekleraStory));
