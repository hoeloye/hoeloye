/* Prices, checkout links and currency for every page on this site.
   One copy, loaded by the landing page and the Recomposition page, so a
   price can never be right in one place and stale in the other. */
/* ── PAYMENTS & CURRENCY ──
   Three products and the consult. Every one has both currencies; the WhatsApp
   fallback in pay() remains only as a safety net if a link is ever pulled. */
const WHATSAPP = 'https://wa.me/message/BFJYP7KFU3A4O1';
const PAY_LINKS = {
  /* Recomposition */
  'program-recomp':   { ngn: 50000,  usd: 36,  stripe: 'https://buy.stripe.com/6oU3cvcwi0uu9eM2ur4ZG0i', paystack: 'https://paystack.shop/pay/dqhrc-4nct' },
  /* Stretching & Mobility */
  'mobility':         { ngn: 25000,  usd: 18,  stripe: 'https://buy.stripe.com/9B6bJ10NAa54aiQ0mj4ZG08', paystack: 'https://paystack.shop/pay/dtbe7h14c8' },
  'mobility-monthly': { ngn: 80000,  usd: 59,  stripe: 'https://buy.stripe.com/9B6aEX1REelk76E5GD4ZG0b', paystack: 'https://paystack.shop/pay/n-4gxj3803' },
  /* 1-on-1 Virtual Coaching */
  'coaching-x10':     { ngn: 130000, usd: 94,  stripe: 'https://buy.stripe.com/00weVd9k65OO1Mked94ZG0g', paystack: 'https://paystack.shop/pay/d99y9pggsp' },
  'coaching-x20':     { ngn: 250000, usd: 181, stripe: 'https://buy.stripe.com/7sY9AT0NA6SS8aI0mj4ZG0h', paystack: 'https://paystack.shop/pay/w63c9jycgp' },
  /* not one of the three. The way in for anyone the page does not convince. */
  'consult':          { ngn: 10000,  usd: 8,   stripe: 'https://buy.stripe.com/8x200jgMygtsez69WT4ZG00', paystack: 'https://paystack.shop/pay/elk4hl42w8' },
};

/* saved choice wins; otherwise Nigeria defaults to NGN, everyone else USD */
let _currency = (function(){
  try{ const s = localStorage.getItem('abs-currency'); if(s === 'NGN' || s === 'USD') return s; }catch(e){}
  try{
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if(tz === 'Africa/Lagos' || /-NG\b/i.test(navigator.language || '')) return 'NGN';
  }catch(e){}
  return 'USD';
})();

function renderPrices(){
  /* buttons first: updatePayButtons restores a cached label, and some labels
     contain a [data-price] span — so prices have to be written after it, not
     before, or the restored HTML puts the old currency back. */
  updatePayButtons();
  document.querySelectorAll('[data-price]').forEach(el => {
    const p = PAY_LINKS[el.dataset.price];
    if(p) el.textContent = _currency === 'NGN' ? '₦' + p.ngn.toLocaleString() : '$' + p.usd.toLocaleString();
  });
  document.querySelectorAll('.currency-tab').forEach(t => t.classList.toggle('active', t.dataset.cur === _currency));
}
/* a product with no checkout in the active currency falls back to WhatsApp —
   say so on the button so the click matches what actually happens */
function updatePayButtons(){
  document.querySelectorAll('[data-pay]').forEach(el => {
    const p = PAY_LINKS[el.dataset.pay];
    const only = el.children.length === 1 && el.firstElementChild.tagName === 'SPAN';
    const label = only ? el.firstElementChild : el;
    if(el.dataset.payLabel === undefined) el.dataset.payLabel = label.innerHTML;
    if(p && (_currency === 'USD' ? p.stripe : p.paystack)){
      label.innerHTML = el.dataset.payLabel;
      el.classList.remove('pay-manual');
      el.removeAttribute('aria-label');
    }else{
      const sym = _currency === 'NGN' ? '₦' : '$';
      label.innerHTML = 'Pay in ' + sym + ' via WhatsApp &rarr;';
      el.classList.add('pay-manual');
      el.setAttribute('aria-label', 'Message Ayo on WhatsApp to pay in ' + (_currency === 'NGN' ? 'Naira' : 'US Dollars'));
    }
  });
}
function setSiteCurrency(code){
  _currency = code;
  try{ localStorage.setItem('abs-currency', code); }catch(e){}
  renderPrices();
}
function pay(key){
  const p = PAY_LINKS[key];
  if(_currency === 'USD' && p && p.stripe){ window.location.href = p.stripe; }
  else if(_currency === 'NGN' && p && p.paystack){ window.location.href = p.paystack; }
  else{ window.open(WHATSAPP, '_blank'); }
}
