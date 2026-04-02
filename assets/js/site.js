
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);

  window.showToast = function(message){
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
  };

  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const selector = btn.getAttribute('data-copy-target');
      const target = document.querySelector(selector);
      if(!target) return;
      const text = target.innerText.trim();
      try{
        await navigator.clipboard.writeText(text);
        window.showToast('Resultado copiado');
      }catch(err){
        window.showToast('No se pudo copiar');
      }
    });
  });

  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const selector = btn.getAttribute('data-share');
      const target = document.querySelector(selector);
      const text = target ? target.innerText.trim() : document.title;
      const shareData = {
        title: document.title,
        text,
        url: location.href
      };
      try{
        if(navigator.share){
          await navigator.share(shareData);
        }else{
          await navigator.clipboard.writeText(`${text}\n${location.href}`);
          window.showToast('Enlace copiado');
        }
      }catch(err){}
    });
  });

  const body = document.body;
  const toolSlug = body.getAttribute('data-tool-slug');
  const toolTitle = body.getAttribute('data-tool-title');
  const toolPath = body.getAttribute('data-tool-path');

  if(toolSlug && toolTitle && toolPath){
    const key = 'ingresolab_recent_tools';
    let recent = [];
    try{
      recent = JSON.parse(localStorage.getItem(key) || '[]');
    }catch(err){}
    recent = recent.filter(item => item.slug !== toolSlug);
    recent.unshift({ slug: toolSlug, title: toolTitle, path: toolPath });
    recent = recent.slice(0, 5);
    localStorage.setItem(key, JSON.stringify(recent));
  }

  const recentContainer = document.querySelector('[data-recent-tools]');
  if(recentContainer){
    let recent = [];
    try{
      recent = JSON.parse(localStorage.getItem('ingresolab_recent_tools') || '[]');
    }catch(err){}
    if(!recent.length){
      recentContainer.innerHTML = '<p class="muted">Todavía no has abierto herramientas. Aquí aparecerán las más recientes.</p>';
    }else{
      recentContainer.innerHTML = recent.map(item => (
        `<a class="link-card" href="${item.path}">${item.title}<small>Vuelve a abrir esta calculadora</small></a>`
      )).join('');
    }
  }
})();
