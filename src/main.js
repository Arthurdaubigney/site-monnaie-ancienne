import './styles.css';

document.documentElement.classList.add('js');

/* ── Menu mobile ── */
const body = document.body;
const toggle = document.querySelector('.nav-toggle');
const setMenu = (open) => {
  body.classList.toggle('nav-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  body.style.overflow = open ? 'hidden' : '';
};
toggle?.addEventListener('click', () => setMenu(!body.classList.contains('nav-open')));
document.querySelectorAll('.mobile-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

/* ── Révélations au scroll ── */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}

/* ── Formulaire Tally ──
   Renseigner l'identifiant du formulaire dans <meta name="tally-form-id" content="XXXXXX">
   (présent sur chaque page). Une fois renseigné :
   - contact.html affiche le formulaire dans l'emplacement #tally-slot ;
   - tous les boutons « Demander une estimation » (.js-estimation) ouvrent la popup Tally
     sur les autres pages. */
const formId = document.querySelector('meta[name="tally-form-id"]')?.content.trim();
if (formId) {
  const slot = document.getElementById('tally-slot');
  const loadWidget = (cb) => {
    if (window.Tally) return cb();
    const s = document.createElement('script');
    s.src = 'https://tally.so/widgets/embed.js';
    s.async = true;
    s.onload = cb;
    document.head.appendChild(s);
  };
  if (slot) {
    slot.classList.add('is-live');
    slot.innerHTML = `<iframe data-tally-src="https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" loading="lazy" title="Formulaire de demande d’estimation"></iframe>`;
    loadWidget(() => window.Tally?.loadEmbeds());
  } else {
    document.querySelectorAll('.js-estimation').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        loadWidget(() => window.Tally?.openPopup(formId, { layout: 'modal', width: 640, autoClose: 0 }));
      });
    });
  }
}
