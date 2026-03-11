// ============================================================
//  DRAWERS — Cart & Filter side panels (STABLE)
// ============================================================

(function () {
  console.log('Drawers JS: Initializing...');

  function getEl(id) { return document.getElementById(id); }

  function _openDrawer(drawerId) {
    var overlay = getEl('drawer-overlay');
    var drawer  = getEl(drawerId);
    if (!overlay || !drawer) return;

    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Using double requestAnimationFrame for reliable style updates
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        overlay.style.opacity = '1';
        drawer.style.transform = 'translateX(0)';
      });
    });
  }

  function _closeDrawer(drawerId) {
    var overlay = getEl('drawer-overlay');
    var drawer  = getEl(drawerId);
    if (!overlay || !drawer) return;

    drawer.style.transform = 'translateX(100%)';
    overlay.style.opacity = '0';
    
    setTimeout(function() {
      // Logic for multi-drawer closing
      var cart    = getEl('cart-drawer');
      var filter  = getEl('filter-drawer');
      
      var isCartOpen   = cart && cart.style.transform === 'translateX(0px)';
      var isFilterOpen = filter && filter.style.transform === 'translateX(0px)';
      
      if (!isCartOpen && !isFilterOpen) {
        overlay.style.display = 'none';
      }
    }, 500);
    
    document.body.style.overflow = '';
  }

  // Bind to window for direct calls
  window.openCart    = function() { _openDrawer('cart-drawer'); };
  window.closeCart   = function() { _closeDrawer('cart-drawer'); };
  window.openFilter  = function() { _openDrawer('filter-drawer'); };
  window.closeFilter = function() { _closeDrawer('filter-drawer'); };
  window.closeAllDrawers = function() { window.closeCart(); window.closeFilter(); };

  // Setup click listeners
  document.addEventListener('click', function (e) {
    // Open triggers: check if target OR any parent has data-drawer-open
    var openBtn = e.target.closest('[data-drawer-open]');
    if (openBtn) {
      // If it's a link or button, don't follow href
      e.preventDefault();
      var id = openBtn.getAttribute('data-drawer-open');
      _openDrawer(id);
      return;
    }

    // Close triggers
    if (e.target.closest('[data-drawer-close]') || e.target.id === 'drawer-overlay') {
      window.closeAllDrawers();
      return;
    }

    // Qty controls
    var qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      var line = qtyBtn.closest('[data-line]');
      var disp = line && line.querySelector('[data-qty-display]');
      if (disp) {
        var n = parseInt(disp.textContent) || 1;
        var op = qtyBtn.getAttribute('data-qty');
        disp.textContent = (op === '+') ? Math.min(n + 1, 99) : Math.max(n - 1, 1);
      }
    }
  });

  console.log('Drawers JS: Ready.');
})();
