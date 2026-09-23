(function(){
  'use strict';
  var button=document.getElementById('load-stream'),status=document.getElementById('stream-status'),note=document.getElementById('embed-note'),box=document.getElementById('twitch-player');
  var chat=document.getElementById('chat-panel'),toggle=document.getElementById('chat-toggle');
  function eligible(){return location.protocol==='https:'&&box.clientWidth>=400;}
  function fallback(){note.textContent='Для встроенного плеера открой сайт по HTTPS в окне шириной от 400 пикселей. На телефоне и в локальном файле используй ссылку «Открыть Twitch».';status.textContent='Просмотр доступен на Twitch';}
  button.addEventListener('click',function(){
    if(!eligible()){fallback();return;}
    button.disabled=true;status.textContent='Подключаем Twitch…';
    var script=document.createElement('script');script.src='https://player.twitch.tv/js/embed/v1.js';
    var timer=setTimeout(function(){status.textContent='Статус не получен — открой Twitch напрямую';},15000);
    script.onerror=function(){clearTimeout(timer);button.disabled=false;status.textContent='Не удалось подключиться';};
    script.onload=function(){
      box.replaceChildren();
      try{var player=new Twitch.Player('twitch-player',{channel:'eeklera',width:'100%',height:Math.max(420,Math.round(box.clientWidth*9/16)),parent:[location.hostname],autoplay:false});
      player.addEventListener(Twitch.Player.ONLINE,function(){clearTimeout(timer);status.textContent='● Сейчас в эфире';});
      player.addEventListener(Twitch.Player.OFFLINE,function(){clearTimeout(timer);status.textContent='Сейчас не в эфире';});
      }catch(error){clearTimeout(timer);status.textContent='Плеер недоступен — открой Twitch напрямую';}
    };document.head.appendChild(script);
  });
  toggle.addEventListener('click',function(){
    if(location.protocol!=='https:'){fallback();return;}
    var open=chat.hidden;chat.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Закрыть чат −':'Открыть чат +';
    if(open&&!chat.firstChild){var frame=document.createElement('iframe');frame.title='Чат Twitch EEKLERA';frame.src='https://www.twitch.tv/embed/eeklera/chat?darkpopout&parent='+encodeURIComponent(location.hostname);chat.appendChild(frame);}
  });
})();
