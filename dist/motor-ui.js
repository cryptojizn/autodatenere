(() => {
  const video=document.getElementById('heroVideo');
  const toggle=document.getElementById('videoToggle');
  const source=video.querySelector('source');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let ready=false;
  const prepare=()=>{if(!ready){source.src=source.dataset.src;video.load();ready=true;}};
  const sync=()=>{toggle.textContent=video.paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',video.paused?'Riproduci il video di copertina':'Metti in pausa il video di copertina');toggle.setAttribute('aria-pressed',String(!video.paused));};
  toggle.addEventListener('click',()=>{prepare();if(video.paused)video.play().catch(sync);else video.pause();});
  video.addEventListener('play',sync);video.addEventListener('pause',sync);video.addEventListener('error',()=>{toggle.textContent='▶';toggle.setAttribute('aria-label','Riprova a riprodurre il video');});
  if(!reduced.matches&&!navigator.connection?.saveData){prepare();video.play().catch(sync);}else sync();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
  reduced.addEventListener('change',event=>{if(event.matches)video.pause();});
  const filters=document.getElementById('filtri');
  const filterToggle=document.querySelector('.filter-toggle');
  filterToggle.addEventListener('click',()=>{const open=filters.classList.toggle('is-open');filterToggle.setAttribute('aria-expanded',String(open));filterToggle.innerHTML=open?'Chiudi i filtri <span>−</span>':'Apri i filtri <span>＋</span>';});
})();
