// =============================================
// FILM GRAIN — animated canvas overlay
//
// How it works:
// 1. A <canvas> element is created and appended to <body>
// 2. Every ~80ms we fill it with random pixel noise
//    using ImageData — direct pixel manipulation
// 3. The canvas sits fixed over the page at very low
//    opacity with mix-blend-mode: multiply, so it
//    tints the cream background like paper grain
//
// Why canvas instead of CSS?
// CSS filters can't produce true random noise that
// changes over time. Canvas gives us per-pixel control.
// ImageData is the fastest way to write raw pixels —
// we skip the drawing API entirely and write RGBA
// values directly into a typed array (Uint8ClampedArray).
// =============================================

(function () {

  const canvas = document.createElement('canvas');
  canvas.id = 'grain-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let animFrame;
  let lastTime = 0;
  // Only redraw every ~80ms — fast enough to feel alive,
  // slow enough not to drain battery on mobile
  const INTERVAL = 80;

  function resize() {
    // Match canvas to viewport exactly
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrain(timestamp) {
    animFrame = requestAnimationFrame(drawGrain);

    // Throttle — skip frames that arrive too soon
    if (timestamp - lastTime < INTERVAL) return;
    lastTime = timestamp;

    const w = canvas.width;
    const h = canvas.height;

    // ImageData is a flat array of RGBA values.
    // Every 4 elements = one pixel: [R, G, B, A, R, G, B, A, ...]
    // Uint8ClampedArray clamps values to 0-255 automatically.
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Random value between 0 and 255
      const value = Math.random() * 255 | 0;
      data[i]     = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      // Alpha: keep low so grain is very subtle
      // 18-22 out of 255 ≈ ~7-8% opacity per pixel
      data[i + 3] = 18 + (Math.random() * 4 | 0);
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Pause grain when tab is hidden — saves CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrame);
    } else {
      lastTime = 0;
      animFrame = requestAnimationFrame(drawGrain);
    }
  });

  // Respect reduced motion preference — some users
  // have this enabled for accessibility reasons
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    canvas.style.display = 'none';
    return;
  }

  window.addEventListener('resize', resize);
  resize();
  animFrame = requestAnimationFrame(drawGrain);

})();
