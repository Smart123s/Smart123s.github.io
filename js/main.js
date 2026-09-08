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

    var avatarBtn = document.querySelector('.profile-avatar');
    if (avatarBtn) {
      var label = isHu ? avatarBtn.getAttribute('data-label-hu') : avatarBtn.getAttribute('data-label-en');
      if (label) {
        avatarBtn.setAttribute('aria-label', label);
        avatarBtn.setAttribute('title', label);
      }
    }
  }

  function init() {
    applyLanguage(document.documentElement.lang || 'en');

    var avatarBtn = document.querySelector('.profile-avatar');
    if (avatarBtn) {
      var isSwapping = false;
      var allowHoverExpand = true;

      function clearJustSwapped() {
        avatarBtn.classList.remove('just-swapped');
        allowHoverExpand = true;
      }

      avatarBtn.addEventListener('mouseleave', clearJustSwapped);

      avatarBtn.addEventListener('mousemove', function() {
        if (!isSwapping && allowHoverExpand && avatarBtn.classList.contains('just-swapped')) {
          clearJustSwapped();
        }
      });

      avatarBtn.addEventListener('click', function() {
        if (isSwapping) return;
        isSwapping = true;
        allowHoverExpand = false;
        avatarBtn.classList.add('just-swapped');

        var currentActive = avatarBtn.getAttribute('data-active') || 'real';
        var nextActive = currentActive === 'real' ? 'mc' : 'real';
        var incomingLayer = currentActive === 'real'
          ? avatarBtn.querySelector('.avatar-mc')
          : avatarBtn.querySelector('.avatar-real');

        if (incomingLayer) {
          incomingLayer.classList.add('is-revealing');
        }
        avatarBtn.classList.add('is-animating');

        setTimeout(function() {
          avatarBtn.setAttribute('data-active', nextActive);
          if (incomingLayer) {
            incomingLayer.classList.remove('is-revealing');
          }
          avatarBtn.classList.remove('is-animating');
          isSwapping = false;

          // Short cooldown so the new avatar can be admired before mouse movement re-expands peek
          setTimeout(function() {
            allowHoverExpand = true;
          }, 350);

          // If user stays hovering without moving mouse, smoothly re-enable hover expansion after 1 second
          setTimeout(function() {
            if (avatarBtn.classList.contains('just-swapped')) {
              clearJustSwapped();
            }
          }, 1200);
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
