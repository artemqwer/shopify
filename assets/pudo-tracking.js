// ══════════════════════════════════════════════════════════════════
// pudo-tracking.js  —  PUDO logistics: shipment status UI helpers
// Works with HFD and Chita IT.
// Docs:
//   HFD:   https://www.hfd.co.il/en/technological-solutions/
//   Chita: https://www.chita-it.co.il/
// ══════════════════════════════════════════════════════════════════

window.PUDOTracking = (function() {

  return {

    /**
     * initWidget(config)
     * Generic PUDO widget init dispatcher.
     * Called from snippets/pudo-widget.liquid
     * @param {{provider: string, containerId: string, apiKey: string, sandbox: boolean, locale: string, onSelect: function}} config
     */
    initWidget: function(config) {
      if (!config || !config.provider) {
        console.warn('[PUDO] No provider specified.');
        return;
      }
      switch (config.provider) {
        case 'hfd':   this.initHFD(config);   break;
        case 'chita': this.initChita(config); break;
        default:
          console.warn('[PUDO] Unknown provider:', config.provider);
      }
    },

    /**
     * initHFD(config)
     * Initialise HFD pickup-point widget.
     * TODO: Replace stub with real SDK call when apiKey is ready.
     */
    initHFD: function(config) {
      if (typeof HFDWidget === 'undefined') {
        console.warn('[PUDO/HFD] SDK not loaded.');
        return;
      }
      HFDWidget.init({
        apiKey    : config.apiKey,
        container : config.containerId,
        sandbox   : config.sandbox,
        lang      : config.locale,
        rtl       : config.locale === 'he',
        onSelect  : config.onSelect || this._defaultOnSelect.bind(this),
      });
    },

    /**
     * initChita(config)
     * Initialise Chita IT pickup-point widget.
     * TODO: Replace stub with real SDK call when apiKey is ready.
     */
    initChita: function(config) {
      if (typeof ChitaWidget === 'undefined') {
        console.warn('[PUDO/Chita] SDK not loaded.');
        return;
      }
      ChitaWidget.init({
        apiKey    : config.apiKey,
        container : config.containerId,
        sandbox   : config.sandbox,
        language  : config.locale,
        rtl       : config.locale === 'he',
        onSelect  : config.onSelect || this._defaultOnSelect.bind(this),
      });
    },

    /**
     * _defaultOnSelect(point)
     * Default callback when user picks a PUDO point.
     * Saves the selection to cart attributes.
     */
    _defaultOnSelect: function(point) {
      fetch('/cart/update.js', {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({
          attributes: {
            pudo_point_id  : point.id,
            pudo_point_name: point.name,
            pudo_point_addr: point.address,
          }
        })
      })
      .then(r => r.json())
      .then(() => console.log('[PUDO] Point saved to cart:', point.name))
      .catch(err => console.error('[PUDO] Cart update failed:', err));
    },

    /**
     * showTrackingInfo(container, trackingNumber, provider)
     * Renders a tracking link in the given container element.
     * Called from order-status page after admin sends the tracking number.
     */
    showTrackingInfo: function(containerId, trackingNumber, provider) {
      const el = document.getElementById(containerId);
      if (!el || !trackingNumber) return;

      const urls = {
        hfd  : 'https://www.hfd.co.il/tracking?id=' + trackingNumber,
        chita: 'https://www.chita-it.co.il/track/' + trackingNumber,
      };

      const url = urls[provider] || '#';
      el.innerHTML =
        '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' +
        'Track your parcel: ' + trackingNumber +
        '</a>';
    }
  };
})();

// ══════════════════════════════════════════════════════════════════
// SERVER-SIDE IMPLEMENTATION NOTES (for Shopify App):
// ══════════════════════════════════════════════════════════════════
//
// Shipping Label Generation:
//   - Triggered from Shopify Admin (or webhook orders/fulfilled)
//   - POST to HFD or Chita API with shipment details
//   - Store returned tracking number on Shopify order via metafield:
//       namespace: "logistics", key: "tracking_number"
//
// Track Number Emails:
//   - Trigger: Shopify webhook orders/fulfilled
//   - Read tracking number from order metafield
//   - Use Shopify Email / custom SMTP to send tracking link to customer
//   - OR use Shopify's built-in fulfillment notifications with tracking URL
//
// Fulfillment flow:
//   1. Admin marks order as fulfilled in Shopify Admin
//   2. Webhook fires: orders/fulfilled
//   3. Shopify App calls HFD/Chita API to generate shipping label
//   4. API returns tracking number → store on order metafield
//   5. Send email to customer with tracking link
