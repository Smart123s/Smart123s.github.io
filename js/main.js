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
    document.title = isHu ? 'Tombor Péter' : 'Péter Tombor';

    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', isHu ? 'Tombor Péter személyes weboldala' : "Péter Tombor's personal website");
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
  }

  function init() {
    applyLanguage(document.documentElement.lang || 'en');

    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetLang = this.getAttribute('data-lang-target');
        if (targetLang) {
          localStorage.setItem('lang', targetLang);
          applyLanguage(targetLang);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
