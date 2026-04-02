
(function(){
  const body = document.body;
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  const toast = document.getElementById('toast');

  function showToast(text){
    if(!toast) return;
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 1800);
  }

  if(navToggle && nav){
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = document.querySelector(btn.getAttribute('data-copy-target'));
      if(!target) return;
      const text = target.innerText.trim();
      try{
        await navigator.clipboard.writeText(text);
        showToast('Result copied');
      }catch(err){
        showToast('Copy failed');
      }
    });
  });

  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = document.querySelector(btn.getAttribute('data-share'));
      const shareText = target ? target.innerText.trim() : document.title;
      const shareData = {
        title: document.title,
        text: shareText,
        url: window.location.href
      };
      try{
        if(navigator.share){
          await navigator.share(shareData);
        }else{
          await navigator.clipboard.writeText(`${document.title}\n${window.location.href}\n\n${shareText}`);
          showToast('Link and result copied');
        }
      }catch(err){}
    });
  });

  document.querySelectorAll('[data-filter-input]').forEach(input => {
    const targetSelector = input.getAttribute('data-filter-input');
    const cards = Array.from(document.querySelectorAll(targetSelector));
    function filter(){
      const q = input.value.trim().toLowerCase();
      cards.forEach(card => {
        const text = (card.getAttribute('data-text') || card.textContent || '').toLowerCase();
        const match = !q || text.includes(q);
        card.classList.toggle('is-hidden', !match);
      });
    }
    input.addEventListener('input', filter);
  });

  if(body.dataset.toolSlug){
    const key = 'earnprism_recent_tools';
    let recent = [];
    try{
      recent = JSON.parse(localStorage.getItem(key) || '[]');
    }catch(err){}
    recent = recent.filter(item => item.slug !== body.dataset.toolSlug);
    recent.unshift({
      slug: body.dataset.toolSlug,
      title: body.dataset.toolTitle,
      path: body.dataset.toolPath
    });
    recent = recent.slice(0, 6);
    localStorage.setItem(key, JSON.stringify(recent));
  }

  document.querySelectorAll('[data-recent-tools]').forEach(container => {
    let recent = [];
    try{
      recent = JSON.parse(localStorage.getItem('earnprism_recent_tools') || '[]');
    }catch(err){}
    if(!recent.length){
      container.innerHTML = '<p class="muted">Open a calculator and your recent tools will appear here.</p>';
      return;
    }
    container.innerHTML = recent.map(item => (
      `<a class="link-card" href="${item.path}"><strong>${item.title}</strong><small>Open this tool again</small></a>`
    )).join('');
  });
})();
