document.addEventListener('DOMContentLoaded', function () {

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Mobile navigation toggle ---- */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    var panel = trigger.nextElementSibling;
    trigger.setAttribute('aria-expanded', 'false');
    panel.style.maxHeight = '0px';

    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.accordion-trigger').forEach(function (other) {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.style.maxHeight = '0px';
      });

      if (!expanded) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---- Gallery lightbox ---- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');

  document.querySelectorAll('.gallery-item').forEach(function (img) {
    img.addEventListener('click', function () {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImg.src = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---- WhatsApp order links with prefilled product message ---- */
  var WHATSAPP_NUMBER = '22661988460';

  document.querySelectorAll('.btn-order[data-product]').forEach(function (btn) {
    var product = btn.getAttribute('data-product');
    var message = 'Bonjour FasoDélices, je souhaite commander : ' + product + '.';
    btn.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    btn.target = '_blank';
    btn.rel = 'noopener';
  });

  /* ---------------------------------------------------------
     Panier groupé — accumule plusieurs produits puis envoie
     un seul message WhatsApp récapitulatif.
     --------------------------------------------------------- */
  var CART_KEY = 'fasodelices_cart';

  function formatPrice(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  var cart = loadCart();

  var cartToggle = document.getElementById('cart-toggle');
  var cartClose = document.getElementById('cart-close');
  var cartDrawer = document.getElementById('cart-drawer');
  var cartOverlayEl = document.getElementById('cart-overlay');
  var cartItemsEl = document.getElementById('cart-items');
  var cartEmptyEl = document.getElementById('cart-empty');
  var cartFooterEl = document.getElementById('cart-footer');
  var cartTotalValueEl = document.getElementById('cart-total-value');
  var cartCountEl = document.getElementById('cart-count');
  var cartCheckoutEl = document.getElementById('cart-checkout');
  var cartClearEl = document.getElementById('cart-clear');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('open');
    cartOverlayEl.classList.add('active');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartToggle.setAttribute('aria-expanded', 'true');
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('open');
    cartOverlayEl.classList.remove('active');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartToggle.setAttribute('aria-expanded', 'false');
  }

  if (cartToggle) cartToggle.addEventListener('click', function () {
    cartDrawer.classList.contains('open') ? closeCart() : openCart();
  });
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlayEl) cartOverlayEl.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCart();
  });

  function renderCart() {
    if (!cartItemsEl) return;

    var totalCount = cart.reduce(function (sum, it) { return sum + it.qty; }, 0);
    if (totalCount > 0) {
      cartCountEl.hidden = false;
      cartCountEl.textContent = totalCount;
      cartCountEl.classList.remove('bump');
      void cartCountEl.offsetWidth;
      cartCountEl.classList.add('bump');
    } else {
      cartCountEl.hidden = true;
    }

    cartItemsEl.querySelectorAll('.cart-item').forEach(function (el) { el.remove(); });

    if (cart.length === 0) {
      cartEmptyEl.hidden = false;
      cartFooterEl.hidden = true;
      return;
    }
    cartEmptyEl.hidden = true;
    cartFooterEl.hidden = false;

    var total = 0;
    var hasEstimate = false;
    var messageLines = [];

    cart.forEach(function (item) {
      var lineTotal = item.price * item.qty;
      total += lineTotal;
      if (item.estimate) hasEstimate = true;

      var row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML =
        '<span class="cart-item-name">' + item.name + '</span>' +
        (item.estimate ? '<span class="cart-item-note">Prix estimé, à confirmer</span>' : '') +
        '<button type="button" class="cart-item-remove" data-remove="' + item.id + '" aria-label="Retirer">&times;</button>' +
        '<div class="cart-item-row">' +
          '<div class="qty-stepper">' +
            '<button type="button" class="qty-btn" data-qty-minus="' + item.id + '" aria-label="Diminuer">–</button>' +
            '<span class="qty-value">' + item.qty + '</span>' +
            '<button type="button" class="qty-btn" data-qty-plus="' + item.id + '" aria-label="Augmenter">+</button>' +
          '</div>' +
          '<span class="cart-item-price">' + formatPrice(lineTotal) + '</span>' +
        '</div>';
      cartItemsEl.appendChild(row);

      messageLines.push('- ' + item.qty + 'x ' + item.name + ' — ' + formatPrice(lineTotal));
    });

    cartTotalValueEl.textContent = formatPrice(total);

    var message = 'Bonjour FasoDélices, je souhaite commander :\n' +
      messageLines.join('\n') +
      '\nTotal estimé : ' + formatPrice(total) +
      (hasEstimate ? '\n(NB : prix des pâtisseries à confirmer selon la taille)' : '');

    cartCheckoutEl.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }

  function addToCart(item) {
    var existing = cart.find(function (it) { return it.id === item.id; });
    if (existing) {
      existing.qty += 1;
    } else {
      item.qty = 1;
      cart.push(item);
    }
    saveCart(cart);
    renderCart();
  }

  cartItemsEl && cartItemsEl.addEventListener('click', function (e) {
    var minusId = e.target.getAttribute('data-qty-minus');
    var plusId = e.target.getAttribute('data-qty-plus');
    var removeId = e.target.getAttribute('data-remove');

    if (minusId) {
      var it = cart.find(function (x) { return x.id === minusId; });
      if (it) {
        it.qty -= 1;
        if (it.qty <= 0) cart = cart.filter(function (x) { return x.id !== minusId; });
      }
    } else if (plusId) {
      var it2 = cart.find(function (x) { return x.id === plusId; });
      if (it2) it2.qty += 1;
    } else if (removeId) {
      cart = cart.filter(function (x) { return x.id !== removeId; });
    } else {
      return;
    }
    saveCart(cart);
    renderCart();
  });

  if (cartClearEl) cartClearEl.addEventListener('click', function () {
    cart = [];
    saveCart(cart);
    renderCart();
  });

  /* ---- Format selectors (Dêguê) : met à jour le prix affiché ---- */
  document.querySelectorAll('.format-select').forEach(function (select) {
    var id = select.getAttribute('data-id');
    var priceDisplay = document.querySelector('[data-price-display="' + id + '"]');

    function updateDisplay() {
      var parts = select.value.split('|');
      if (priceDisplay) priceDisplay.textContent = formatPrice(parseInt(parts[1], 10));
    }
    updateDisplay();
    select.addEventListener('change', updateDisplay);
  });

  /* ---- Add-to-cart buttons ---- */
  document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-id');
      var item;

      if (btn.getAttribute('data-variant') === 'true') {
        var select = document.getElementById('format-' + id);
        var parts = select.value.split('|');
        var formatLabel = parts[0];
        var price = parseInt(parts[1], 10);
        item = {
          id: id + '-' + formatLabel,
          name: select.getAttribute('data-name') + ' (' + formatLabel + ')',
          price: price
        };
      } else {
        item = {
          id: id,
          name: btn.getAttribute('data-name'),
          price: parseInt(btn.getAttribute('data-price'), 10),
          estimate: btn.getAttribute('data-estimate') === 'true'
        };
      }

      addToCart(item);

      var originalText = btn.textContent;
      btn.textContent = 'Ajouté ✓';
      btn.classList.add('added');
      setTimeout(function () {
        btn.textContent = originalText;
        btn.classList.remove('added');
      }, 1200);
    });
  });

  renderCart();

});
