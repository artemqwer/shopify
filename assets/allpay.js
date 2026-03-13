// ══════════════════════════════════════════════════════════════════
// allpay.js  —  Allpay payment flow (Theme Asset)
// Handles webhook acknowledgment from client side and order status.
// Server-side webhook processing must happen in a Shopify App / Function.
// Docs: https://www.allpay.co.il/en/api-reference
// ══════════════════════════════════════════════════════════════════

window.AllpayIntegration = (function() {

  // ── Config (populated from theme settings via Liquid) ──────────
  // These values should be rendered by Liquid before this script runs:
  //   var ALLPAY_CONFIG = { terminal: '...', sandbox: true, locale: 'he' };
  const cfg = window.ALLPAY_CONFIG || {};

  // ── Public API ─────────────────────────────────────────────────
  return {

    /**
     * initHostedFields()
     * Call this after AllpayHostedFields SDK has loaded.
     * Renders secure iFrame fields into the containers defined in
     * snippets/allpay-hosted-fields.liquid
     */
    initHostedFields: function() {
      if (typeof AllpayHostedFields === 'undefined') {
        console.warn('[Allpay] SDK not available.');
        return;
      }
      // TODO: Wire up once terminal + public key are set.
      // See snippets/allpay-hosted-fields.liquid for full init code.
    },

    /**
     * handleReturnUrl(params)
     * Allpay redirects back to the store after 3DS / redirect payment flows.
     * Parse URL params and confirm order status.
     * @param {URLSearchParams} params
     */
    handleReturnUrl: function(params) {
      const status   = params.get('Status');
      const orderId  = params.get('orderId') || params.get('MerchantOrderRef');
      const txnId    = params.get('TranzilaTK') || params.get('TransactionId');

      if (!status || !orderId) {
        console.warn('[Allpay] handleReturnUrl: missing params.');
        return;
      }

      if (status === '000' || status === '0') {
        // Payment approved — update cart note and redirect to thank-you
        this._updateCartAndRedirect(orderId, txnId);
      } else {
        // Payment failed
        console.error('[Allpay] Payment failed. Status:', status);
        this._showPaymentError(status);
      }
    },

    /**
     * _updateCartAndRedirect(orderId, txnId)
     * Writes transaction ID to Shopify cart attributes before
     * redirecting to checkout (so it appears in the order).
     */
    _updateCartAndRedirect: function(orderId, txnId) {
      fetch('/cart/update.js', {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({
          attributes: {
            allpay_order_id     : orderId,
            allpay_transaction_id: txnId,
            allpay_status       : 'approved',
          }
        })
      })
      .then(() => { window.location.href = '/checkout'; })
      .catch(err => console.error('[Allpay] Cart update failed:', err));
    },

    /**
     * _showPaymentError(statusCode)
     * Displays an error to the user.
     */
    _showPaymentError: function(statusCode) {
      const el = document.getElementById('allpay-error-msg');
      if (el) {
        el.textContent = 'Payment declined (code: ' + statusCode + '). Please try again or use a different card.';
      }
    },

    /**
     * getStatusDescription(code)
     * Human-readable Allpay status codes.
     */
    getStatusDescription: function(code) {
      const codes = {
        '000': 'Approved',
        '001': 'Blocked card',
        '002': 'Stolen card',
        '003': 'Contact issuer',
        '005': 'Declined',
        '006': 'Error in card number',
        '012': 'Invalid transaction',
        '033': 'Expired card',
        '036': 'Restricted card',
        '039': 'No credit account',
        '041': 'Lost card',
        '051': 'Insufficient funds',
        '054': 'Expired card',
        '057': 'Transaction not permitted',
        '058': 'Transaction not permitted to terminal',
        '061': 'Exceeds withdrawal amount limit',
        '062': 'Restricted card',
        '065': 'Exceeds withdrawal frequency limit',
        '091': 'Issuer not available',
        '096': 'System malfunction',
      };
      return codes[code] || 'Unknown error (' + code + ')';
    }
  };
})();

// Auto-handle return URL if on return page
(function() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('Status') && params.has('orderId')) {
    window.AllpayIntegration.handleReturnUrl(params);
  }
})();
