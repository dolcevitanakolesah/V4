/* Italian Finds: compatible with the older #car-grid / #modal page structure.
   Reads cars from cars.json and loads each car's numbered photos dynamically. */
(() => {
  const grid = document.querySelector('#car-grid');
  const modal = document.querySelector('#modal');
  if (!grid || !modal) {
    console.error('Italian Finds: expected #car-grid and #modal in index.html. This script must match the page HTML.');
    return;
  }
  let cars = [];
  let currentCar = 0;
  let currentImage = 0;
  let gallery = [];
  const $ = (selector) => document.querySelector(selector);
  const asset = (car, filename) => `assets/${car.folder}/${filename}`;
  const pad = (n) => String(n).padStart(2, '0');

  function addCard(car, i) {
    const card = document.createElement('article');
    card.className = 'car-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open gallery for ${car.year} ${car.name}`);
    const img = document.createElement('img');
    img.className = 'car-photo';
    img.src = asset(car, `${car.prefix}-Main.jpg`);
    img.alt = `${car.year} ${car.name}`;
    img.loading = i < 4 ? 'eager' : 'lazy';
    img.onerror = () => { card.remove(); };
    const info = document.createElement('div');
    info.className = 'car-info';
    const titleWrap = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'car-title';
    title.textContent = `${car.year} ${car.name}`;
    titleWrap.appendChild(title);
    const meta = document.createElement('p');
    meta.className = 'car-meta';
    meta.textContent = 'Scouted in Italy';
    titleWrap.appendChild(meta);
    info.appendChild(titleWrap);
    card.append(img, info);
    card.addEventListener('click', () => openGallery(i));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGallery(i); } });
    grid.appendChild(card);
  }

  function loadImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }

  async function openGallery(index) {
    currentCar = index;
    currentImage = 0;
    const car = cars[currentCar];
    gallery = [];
    // Discover consecutive numbered photos; no placeholders are generated.
    for (let n = 1; n <= 250; n++) {
      const filename = `${car.prefix}-${pad(n)}.jpg`;
      const src = asset(car, filename);
      if (!await loadImage(src)) break;
      gallery.push({ type: 'image', src });
    }
    // Videos, if present, are checked after photos. Name them PREFIX-video-01.mp4 etc.
    for (let n = 1; n <= 30; n++) {
      const filename = `${car.prefix}-video-${pad(n)}.mp4`;
      const src = asset(car, filename);
      const exists = await new Promise(resolve => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => resolve(true);
        video.onerror = () => resolve(false);
        video.src = src;
      });
      if (!exists) break;
      gallery.push({ type: 'video', src });
    }
    if (!gallery.length) {
      // Show the Main image if there are no numbered detail photos.
      gallery.push({ type: 'image', src: asset(car, `${car.prefix}-Main.jpg`) });
    }
    $('#modal-title').textContent = `${car.year} ${car.name}`;
    const status = $('#modal-status'); if (status) status.textContent = car.status || '';
    const desc = $('#modal-desc'); if (desc) desc.textContent = [car.desc, car.story].filter(Boolean).join(' ');
    renderGallery();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const close = $('.close'); if (close) close.focus();
  }

  function renderGallery() {
    const item = gallery[currentImage];
    const image = $('#gallery-image');
    const count = $('#gallery-count');
    const thumbs = $('#gallery-thumbs');
    if (!item || !image || !count || !thumbs) return;
    const existingVideo = $('#gallery-video');
    if (existingVideo) existingVideo.remove();
    if (item.type === 'video') {
      image.style.display = 'none';
      let video = document.createElement('video');
      video.id = 'gallery-video'; video.src = item.src; video.controls = true; video.autoplay = true; video.playsInline = true;
      image.parentNode.insertBefore(video, image.nextSibling);
    } else {
      image.style.display = '';
      image.src = item.src;
      image.alt = `${cars[currentCar].year} ${cars[currentCar].name}`;
    }
    count.textContent = `${currentImage + 1} / ${gallery.length}`;
    thumbs.innerHTML = '';
    gallery.forEach((entry, i) => {
      const button = document.createElement('button');
      button.className = i === currentImage ? 'active' : '';
      button.setAttribute('aria-label', `Open item ${i + 1}`);
      if (entry.type === 'image') {
        const thumb = document.createElement('img'); thumb.src = entry.src; thumb.alt = ''; button.appendChild(thumb);
      } else {
        button.textContent = '▶';
      }
      button.addEventListener('click', () => { currentImage = i; renderGallery(); });
      thumbs.appendChild(button);
    });
  }

  function move(delta) {
    if (!gallery.length) return;
    currentImage = (currentImage + delta + gallery.length) % gallery.length;
    renderGallery();
  }
  function closeGallery() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const video = $('#gallery-video'); if (video) video.remove();
  }

  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeGallery));
  const closeButton = $('.close'); if (closeButton) closeButton.addEventListener('click', closeGallery);
  const prev = $('.prev'); if (prev) prev.addEventListener('click', () => move(-1));
  const next = $('.next'); if (next) next.addEventListener('click', () => move(1));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeGallery();
    if (modal.classList.contains('open') && e.key === 'ArrowLeft') move(-1);
    if (modal.classList.contains('open') && e.key === 'ArrowRight') move(1);
  });
  document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter || 'all';
    grid.querySelectorAll('.car-card').forEach((card, i) => {
      const car = cars[Number(card.dataset.carIndex)];
      card.style.display = filter === 'all' || (car && car.category === filter) ? '' : 'none';
    });
  }));
  const menu = $('.menu'); if (menu) menu.addEventListener('click', () => { const nav = document.querySelector('.topbar nav'); if (nav) nav.classList.toggle('mobile-open'); });

  fetch('cars.json').then(response => { if (!response.ok) throw new Error('cars.json could not be loaded'); return response.json(); })
    .then(data => { cars = data; cars.forEach((car, i) => addCard(car, i)); })
    .catch(error => { grid.innerHTML = '<p>Could not load cars.json. Make sure it is in the repository root.</p>'; console.error(error); });
})();
