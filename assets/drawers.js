// ============================================================
//  DRAWERS — Cart & Filter side panels (ROBUST VERSION)
// ============================================================

(function () {
  console.log('Drawers JS loaded and running');

  function getEl(id) { return document.getElementById(id); }

  function _openDrawer(drawerId) {
    var overlay = getEl('drawer-overlay');
    var drawer  = getEl(drawerId);
    if (!overlay || !drawer) {
      console.error('Drawer elements not found:', drawerId);
      return;
    }

    // Use inline styles to guarantee values regardless of Tailwind scan
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Tiny delay to trigger CSS transition
    setTimeout(function() {
      overlay.style.opacity = '1';
      drawer.style.transform = 'translateX(0)';
    }, 10);
  }

  function _closeDrawer(drawerId) {
    var overlay = getEl('drawer-overlay');
    var drawer  = getEl(drawerId);
    if (!overlay || !drawer) return;

    drawer.style.transform = 'translateX(100%)';
    overlay.style.opacity = '0';
    
    setTimeout(function() {
      // Check if other drawer is still open before hiding overlay
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

  // Global exposure
  window.openCart    = function () { _openDrawer('cart-drawer'); };
  window.closeCart   = function () { _closeDrawer('cart-drawer'); };
  window.openFilter  = function () { _openDrawer('filter-drawer'); };
  window.closeFilter = function () { _closeDrawer('filter-drawer'); };
  window.closeAllDrawers = function () { 
    window.closeCart(); 
    window.closeFilter(); 
  };

  // Event delegation
  document.addEventListener('click', function (e) {
    // Open triggers
    var openBtn = e.target.closest('[data-drawer-open]');
    if (openBtn) {
      e.preventDefault();
      var id = openBtn.getAttribute('data-drawer-open');
      _openDrawer(id);
      return;
    }

    // Close triggers
    var closeBtn = e.target.closest('[data-drawer-close]');
    if (closeBtn || e.target.id === 'drawer-overlay') {
      window.closeAllDrawers();
      return;
    }

    // Quantity controls (Static demo logic)
    var qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      var line = qtyBtn.closest('[data-line]');
      var display = line && line.querySelector('[data-qty-display]');
      if (display) {
        var current = parseInt(display.textContent) || 1;
        var dir = qtyBtn.getAttribute('data-qty');
        if (dir === '+') display.textContent = Math.min(current + 1, 99);
        if (dir === '-') display.textContent = Math.max(current - 1, 1);
      }
    }
  });
})();
