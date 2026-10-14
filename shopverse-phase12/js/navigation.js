document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('#menuToggle');
  const nav = document.querySelector('#categoryMenu');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close categories menu' : 'Open categories menu');
    nav.classList.toggle('menu-open', open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) { nav.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); }
  });
});
