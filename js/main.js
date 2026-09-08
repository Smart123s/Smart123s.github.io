(function() {
  function getPreferredLanguage() {
    var stored = localStorage.getItem('lang');
    if (stored === 'hu' || stored === 'en') {
      return stored;
    }
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i++) {
      var l = (langs[i] || '').toLowerCase();
      if (l.startsWith('hu')) return 'hu';
      if (l.startsWith('en')) return 'en';
    }
    return 'en';
  }

  // Replace no-js class with js
  document.documentElement.classList.replace('no-js', 'js');

  // Set document language immediately to prevent layout shift or content flicker
  var initialLang = getPreferredLanguage();
  document.documentElement.lang = initialLang;

  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    var isHu = lang === 'hu';
    var titleEl = document.querySelector('title');
    if (titleEl && titleEl.getAttribute('data-title-hu') && titleEl.getAttribute('data-title-en')) {
      document.title = isHu ? titleEl.getAttribute('data-title-hu') : titleEl.getAttribute('data-title-en');
    } else {
      document.title = isHu ? 'Tombor Péter' : 'Péter Tombor';
    }

    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      var descHu = descMeta.getAttribute('data-desc-hu');
      var descEn = descMeta.getAttribute('data-desc-en');
      if (descHu && descEn) {
        descMeta.setAttribute('content', isHu ? descHu : descEn);
      } else {
        descMeta.setAttribute('content', isHu ? 'Tombor Péter személyes weboldala' : "Péter Tombor's personal website");
      }
    }

    var scrollLink = document.querySelector('.scroll-indicator');
    if (scrollLink) {
      scrollLink.setAttribute('aria-label', isHu ? 'Görgess le a tartalomhoz' : 'Scroll down to content');
    }

    document.querySelectorAll('[data-alt-en][data-alt-hu]').forEach(function(img) {
      img.setAttribute('alt', isHu ? img.getAttribute('data-alt-hu') : img.getAttribute('data-alt-en'));
    });

    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      var active = btn.getAttribute('data-lang-target') === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    var avatarBtn = document.querySelector('.profile-avatar');
    if (avatarBtn) {
      var label = isHu ? avatarBtn.getAttribute('data-label-hu') : avatarBtn.getAttribute('data-label-en');
      if (label) {
        avatarBtn.setAttribute('aria-label', label);
        avatarBtn.setAttribute('title', label);
      }
    }

    document.querySelectorAll('.code-copy-btn').forEach(function(btn) {
      var isCopied = btn.classList.contains('is-copied');
      if (isCopied) {
        btn.setAttribute('aria-label', isHu ? 'Másolva a vágólapra' : 'Copied to clipboard');
      } else {
        btn.setAttribute('aria-label', isHu ? 'Kód másolása a vágólapra' : 'Copy code to clipboard');
      }
    });
  }

  function init() {
    applyLanguage(document.documentElement.lang || 'en');

    var avatarBtn = document.querySelector('.profile-avatar');
    if (avatarBtn) {
      var isSwapping = false;

      avatarBtn.addEventListener('click', function() {
        if (isSwapping) return;
        isSwapping = true;

        var currentActive = avatarBtn.getAttribute('data-active') || 'real';
        var nextActive = currentActive === 'real' ? 'mc' : 'real';

        avatarBtn.classList.add('is-animating');

        setTimeout(function() {
          avatarBtn.setAttribute('data-active', nextActive);
        }, 150);

        setTimeout(function() {
          avatarBtn.classList.remove('is-animating');
          isSwapping = false;
        }, 450);
      });
    }

    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetLang = this.getAttribute('data-lang-target');
        if (targetLang) {
          localStorage.setItem('lang', targetLang);
          applyLanguage(targetLang);
        }
      });
    });

    document.querySelectorAll('.code-copy-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetSelector = btn.getAttribute('data-clipboard-target');
        var targetEl = targetSelector ? document.querySelector(targetSelector) : null;
        if (!targetEl) return;
        var text = (targetEl.innerText || targetEl.textContent || '').trim();
        navigator.clipboard.writeText(text).then(function() {
          btn.classList.add('is-copied');
          var isHu = document.documentElement.lang === 'hu';
          btn.setAttribute('aria-label', isHu ? 'Másolva a vágólapra' : 'Copied to clipboard');
          if (btn._copyTimeout) clearTimeout(btn._copyTimeout);
          btn._copyTimeout = setTimeout(function() {
            btn.classList.remove('is-copied');
            btn.setAttribute('aria-label', isHu ? 'Kód másolása a vágólapra' : 'Copy code to clipboard');
          }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy text: ', err);
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
