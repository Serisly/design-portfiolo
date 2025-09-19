(function(){
  const ATTRS = [
    ['data-src','src'],
    ['data-lazy-src','src'],
    ['data-original','src'],
    ['data-file','src'],
    ['data-srcset','srcset'],
    ['data-lazy-srcset','srcset'],
    ['data-sizes','sizes']
  ];

  function swapAttrs(el){
    ATTRS.forEach(([from,to])=>{
      if(el.hasAttribute(from) && !el.hasAttribute(to)){
        try { el.setAttribute(to, el.getAttribute(from)); } catch(e){}
        el.removeAttribute(from);
      }
    });
    if(el.classList) { el.classList.remove('lazy'); el.classList.remove('loading'); }
  }

  function scan(root){
    root.querySelectorAll('img,video,iframe,source').forEach(el => swapAttrs(el));
    document.querySelectorAll('video').forEach(v => {
      v.querySelectorAll('source').forEach(s => swapAttrs(s));
      if(v.hasAttribute('data-src') && !v.hasAttribute('src')) { v.setAttribute('src', v.getAttribute('data-src')); v.removeAttribute('data-src'); }
    });
    // fallback: find Imgur urls in outerHTML for malformed attributes
    const URL_RE = /https?:\/\/i\.imgur\.com\/[^\s"'<>)]*/gi;
    document.querySelectorAll('img,video,iframe,source').forEach(el => {
      const has = el.getAttribute('src') || el.getAttribute('srcset');
      if(!has){
        const m = (el.outerHTML || '').match(URL_RE);
        if(m && m[0]) el.setAttribute('src', m[0]);
      }
    });
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scan(document));
  } else {
    scan(document);
  }

  // Watch for DOM mutations (in case things are inserted later)
  const mo = new MutationObserver(records => {
    records.forEach(r => {
      r.addedNodes.forEach(node => {
        if(node.nodeType === 1) {
          if(node.matches && node.matches('img,video,iframe,source')) swapAttrs(node);
          if(node.querySelector) scan(node);
        }
      });
    });
  });
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();
