(function () {
  const lightbox    = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox img');
  const closeBtn    = document.querySelector('.lightbox-close');
  const prevBtn     = document.querySelector('.lightbox-prev');
  const nextBtn     = document.querySelector('.lightbox-next');
  const counter     = document.querySelector('.lightbox-counter');
  const photoItems  = document.querySelectorAll('.photo-item');

  if (!lightbox) return;

  const images = Array.from(photoItems).map(item => {
    const img = item.querySelector('img');
    return {
      src: item.dataset.full || img.src,
      alt: img.alt,
    };
  });

  let current = 0;

  function open(index) {
    current = index;
    render();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function render() {
    lightboxImg.style.opacity = '0.5';
    lightboxImg.src = images[current].src;
    lightboxImg.alt = images[current].alt;
    lightboxImg.onload = () => { lightboxImg.style.opacity = '1'; };
    counter.textContent = `${current + 1} / ${images.length}`;
  }

  function prev() { current = (current - 1 + images.length) % images.length; render(); }
  function next() { current = (current + 1) % images.length; render(); }

  photoItems.forEach((item, index) => item.addEventListener('click', () => open(index)));
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     close();
  });
})();
