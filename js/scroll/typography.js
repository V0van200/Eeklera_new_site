/* Shared namespace; classic scripts work via file:// and /redesign/. */
window.EekleraStory = window.EekleraStory || {};
(function (api) {
  'use strict';
  api.Typography = function (headings) {
    var originals = [];
    headings.forEach(function (heading) {
      originals.push({node:heading,html:heading.innerHTML,label:heading.getAttribute('aria-label')});
      heading.setAttribute('aria-label',heading.innerText.replace(/\s+/g,' ').trim());
      var walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT), nodes=[];
      while(walker.nextNode()) nodes.push(walker.currentNode);
      var count=0;
      nodes.forEach(function(node){
        var fragment=document.createDocumentFragment();
        // Preserve normal word wrapping and the existing italic spans.
        node.textContent.split(/(\s+)/).forEach(function(word){
          if(!word.trim()){fragment.appendChild(document.createTextNode(word));return;}
          var group=document.createElement('span');group.className='story-word';group.setAttribute('aria-hidden','true');
          Array.from(word).forEach(function(letter){var span=document.createElement('span');span.className='story-letter';span.textContent=letter;span.style.setProperty('--letter',count++);group.appendChild(span);});
          fragment.appendChild(group);
        });node.replaceWith(fragment);
      });
      heading.classList.add('story-heading');
    });
    this.render=function(heading,entry,exit){
      var letters=heading.querySelectorAll('.story-letter');
      letters.forEach(function(letter,i){
        var delay=(i%9)*.025;
        var t=Math.max(0,Math.min(1,(entry-delay)/.65));
        var eased=1-Math.pow(1-t,3);
        var residual=1-eased;
        letter.style.transform='perspective(700px) translate3d('+(residual*(i%2?15:-15))+'px,'+(residual*22-exit*8)+'px,'+(-residual*170)+'px) rotateX('+(residual*65)+'deg)';
        letter.style.clipPath='inset('+((1-eased)*85)+'% 0 0 0)';
        letter.style.opacity=String(.15+.85*eased);
      });
    };
    this.dispose=function(){originals.forEach(function(item){item.node.innerHTML=item.html;item.node.classList.remove('story-heading');if(item.label===null)item.node.removeAttribute('aria-label');else item.node.setAttribute('aria-label',item.label);});};
  };
}(window.EekleraStory));

