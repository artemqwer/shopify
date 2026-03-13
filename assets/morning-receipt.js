// ══════════════════════════════════════════════════════════════════
// morning-receipt.js  —  Morning / Green Invoice receipt trigger
// NOTE: Actual API calls (with secret key) MUST be server-side.
//       This file handles ONLY client-side triggers and UI feedback.
// Docs: https://greeninvoice.docs.apiary.io/
// ══════════════════════════════════════════════════════════════════

window.MorningReceipt = (function() {

  return {

    /**
     * notifyReceiptSent(email)
     * Called after the server-side Shopify App/Function creates the
     * Morning receipt and sends it via domain email.
     * Shows a confirmation message to the customer.
     * @param {string} email - customer email
     */
    notifyReceiptSent: function(email) {
      const container = document.getElementById('morning-receipt-status');
      if (container) {
        container.textContent = 'A receipt has been sent to ' + email;
        container.classList.remove('hidden');
      }
      console.log('[Morning] Receipt sent to:', email);
    },

    /**
     * notifyReceiptError(err)
     * Called if receipt creation fails.
     * @param {string} err
     */
    notifyReceiptError: function(err) {
      const container = document.getElementById('morning-receipt-status');
      if (container) {
        container.textContent = 'Receipt could not be sent. Please contact support.';
        container.classList.remove('hidden');
      }
      console.error('[Morning] Receipt error:', err);
    },

    /**
     * requestReceiptResend(orderId)
     * Allows a customer to request a resend of the receipt.
     * Triggers a Shopify App Proxy endpoint that calls Morning API server-side.
     * @param {string} orderId - Shopify order ID or number
     */
    requestReceiptResend: function(orderId) {
      // ── TODO: Point to Shopify App Proxy URL that calls Morning API ──
      // The App Proxy URL format: /apps/{proxy_sub_path}/morning/resend
      const proxyUrl = '/apps/ester-backend/morning/resend';

      fetch(proxyUrl, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({ order_id: orderId })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          this.notifyReceiptSent(data.email);
        } else {
          this.notifyReceiptError(data.error || 'Unknown error');
        }
      })
      .catch(err => this.notifyReceiptError(err.message));
    }
  };
})();

// ══════════════════════════════════════════════════════════════════
// SERVER-SIDE IMPLEMENTATION NOTES (for Shopify App / Functions):
// ══════════════════════════════════════════════════════════════════
//
// Morning API endpoints used:
//   POST /v1/documents/createWithSend
//     → Creates + sends Heshbonit Mas (type 300) automatically.
//     → Requires: apiId, apiSecret, document.type, client.*, income.*, payment.*
//
// Recommended flow (triggered by Shopify webhook orders/paid):
//   1. Receive Shopify webhook: orders/paid
//   2. Extract: customer name, email, items, total, payment method
//   3. POST to Morning API → createWithSend with document type 300
//   4. Morning sends receipt to customer from your domain email
//   5. Store Morning documentId on Shopify order (via order note or metafield)
//
// Morning Sandbox base URL: https://sandbox.d.greeninvoice.co.il/api/v1
// Morning Production URL:   https://api.greeninvoice.co.il/api/v1
//
// Auth: JWT token obtained via POST /v1/account/token
//   { id: MORNING_API_ID, secret: MORNING_API_SECRET }
