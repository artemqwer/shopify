// ============================================================
//  DRAWERS — Cart & Filter side panels
//  Uses event delegation so no inline onclick needed
// ============================================================

(function () {
  function getEl(id) { return document.getElementById(id); }

  function _openDrawer(drawerId) {
    var overlay = getEl('drawer-overlay');
    var drawer  = getEl(drawerId);
    if (!overlay || !drawer) return;
    overlay.classList.remove('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('opacity-100');
        drawer.classList.remove('translate-x-full');
      });
    });
    document.body.style.overflow = 'hidden';
  }

  function _closeDrawer(drawerId) {
    var overlay = getEl('drawer-overlay');
    var drawer  = getEl(drawerId);
    if (!overlay || !drawer) return;
    drawer.classList.add('translate-x-full');
    overlay.classList.remove('opacity-100');
    setTimeout(function () {
      var cartOpen   = !(getEl('cart-drawer')  ?.classList.contains('translate-x-full') ?? true);
      var filterOpen = !(getEl('filter-drawer')?.classList.contains('translate-x-full') ?? true);
      if (!cartOpen && !filterOpen) overlay.classList.add('hidden');
    }, 350);
    document.body.style.overflow = '';
  }

  // Expose globally for legacy onclick attributes
  window.openCart    = function () { _openDrawer('cart-drawer'); };
  window.closeCart   = function () { _closeDrawer('cart-drawer'); };
  window.openFilter  = function () { _openDrawer('filter-drawer'); };
  window.closeFilter = function () { _closeDrawer('filter-drawer'); };
  window.closeAllDrawers = function () { window.closeCart(); window.closeFilter(); };

  // ---- Event delegation on document ----
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-drawer-open]');
    if (btn) { _openDrawer(btn.getAttribute('data-drawer-open')); return; }

    var close = e.target.closest('[data-drawer-close]');
    if (close) { _closeDrawer(close.getAttribute('data-drawer-close')); return; }

    // Click on overlay itself
    if (e.target.id === 'drawer-overlay') { window.closeAllDrawers(); return; }

    // Quantity controls
    var qty = e.target.closest('[data-qty]');
    if (qty) {
      var line = qty.closest('[data-line]');
      var display = line && line.querySelector('[data-qty-display]');
      if (display) {
        var val = parseInt(display.textContent) || 1;
        if (qty.getAttribute('data-qty') === '+') val = Math.min(val + 1, 99);
        if (qty.getAttribute('data-qty') === '-') val = Math.max(val - 1, 1);
        display.textContent = val;
      }
    }
  });
})();
