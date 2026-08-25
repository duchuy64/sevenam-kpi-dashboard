(() => {
  'use strict';
  const MODULES = {
    commercial: {
      title: 'Commercial Dashboard',
      src: 'modules/commercial/index.html'
    },
    kpi: {
      title: 'KPI Dashboard BC1 & BC2',
      src: 'modules/kpi/index.html'
    }
  };
  const frame = document.getElementById('moduleFrame');
  const status = document.getElementById('hubStatus');
  const tabs = [...document.querySelectorAll('.hub-tab')];

  function resolveKey(value){
    const key = String(value || '').replace(/^#/, '').toLowerCase();
    return MODULES[key] ? key : 'kpi';
  }

  function activate(key, updateHash = true){
    key = resolveKey(key);
    const cfg = MODULES[key];
    tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.module === key));
    status.textContent = cfg.title;
    const wanted = new URL(cfg.src, location.href).href;
    if(frame.src !== wanted) frame.src = cfg.src;
    if(updateHash && location.hash !== '#' + key){
      history.replaceState(null, '', '#' + key);
    }
  }

  tabs.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.module, true)));
  window.addEventListener('hashchange', () => activate(location.hash, false));
  activate(location.hash, false);
})();
