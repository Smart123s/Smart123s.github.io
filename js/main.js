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

    updateRotatorWidth(true);
    updateRotatorTitles();
  }

  var currentRoleIndex = 0;
  var roleRotatorTimer = null;
  var roleRotatorStep = 0;
  var isRotatorPaused = false;
  var ROTATOR_DELAYS = [1800, 2400, 3000, 4000];
  var ROTATOR_DEFAULT_DELAY = 4000;

  function getNextRotatorDelay() {
    if (roleRotatorStep < ROTATOR_DELAYS.length) {
      return ROTATOR_DELAYS[roleRotatorStep];
    }
    return ROTATOR_DEFAULT_DELAY;
  }

  function scheduleNextRoleSwap() {
    if (isRotatorPaused) return;
    if (roleRotatorTimer) {
      clearTimeout(roleRotatorTimer);
      roleRotatorTimer = null;
    }
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    var delay = getNextRotatorDelay();
    roleRotatorTimer = setTimeout(function() {
      if (document.hidden || isRotatorPaused) {
        scheduleNextRoleSwap();
        return;
      }
      var nextIndex = currentRoleIndex === 0 ? 1 : 0;
      setRoleIndex(nextIndex, true);
      roleRotatorStep++;
      scheduleNextRoleSwap();
    }, delay);
  }

  function pauseRoleRotator() {
    if (isRotatorPaused) return;
    isRotatorPaused = true;
    if (roleRotatorTimer) {
      clearTimeout(roleRotatorTimer);
      roleRotatorTimer = null;
    }
    var profileEl = document.querySelector('.profile');
    if (profileEl) {
      profileEl.setAttribute('data-rotator-paused', 'true');
    }
    updateRotatorTitles();
  }

  function resumeRoleRotator() {
    if (!isRotatorPaused) return;
    isRotatorPaused = false;
    var profileEl = document.querySelector('.profile');
    if (profileEl) {
      profileEl.removeAttribute('data-rotator-paused');
    }
    updateRotatorTitles();
    var nextIndex = currentRoleIndex === 0 ? 1 : 0;
    setRoleIndex(nextIndex, true);
    scheduleNextRoleSwap();
  }

  function toggleRoleRotator() {
    if (isRotatorPaused) {
      resumeRoleRotator();
    } else {
      pauseRoleRotator();
    }
  }

  function updateRotatorTitles() {
    var isHu = document.documentElement.lang === 'hu';
    var title = isRotatorPaused
      ? (isHu ? 'Kattints az animáció folytatásához' : 'Click to resume animation')
      : (isHu ? 'Kattints az animáció szüneteltetéséhez' : 'Click to pause animation');

    document.querySelectorAll('.role-rotator').forEach(function(rotator) {
      rotator.setAttribute('title', title);
      rotator.setAttribute('aria-pressed', isRotatorPaused ? 'true' : 'false');
    });

    var resumeBtn = document.querySelector('.resume-rotator-btn');
    if (resumeBtn) {
      var btnLabel = isHu ? 'Animáció folytatása' : 'Resume animation';
      resumeBtn.setAttribute('aria-label', btnLabel);
    }
  }

  function updateRotatorWidth(immediate) {
    var currentLang = document.documentElement.lang || 'en';
    document.querySelectorAll('.role-rotator').forEach(function(rotator) {
      var langContainer = rotator.closest('[data-lang]');
      if (langContainer && langContainer.getAttribute('data-lang') !== currentLang) {
        return;
      }
      var words = rotator.querySelectorAll('.role-rotator-word');
      var activeWord = words[currentRoleIndex] || words[0];
      if (activeWord) {
        var width = Math.ceil(activeWord.offsetWidth) + 1;
        if (width > 1) {
          if (immediate) {
            var prevTransition = rotator.style.transition;
            rotator.style.transition = 'none';
            rotator.style.width = width + 'px';
            rotator.offsetHeight;
            rotator.style.transition = prevTransition;
          } else {
            rotator.style.width = width + 'px';
          }
        }
      }
    });
  }

  function setRoleIndex(nextIndex, animate) {
    document.querySelectorAll('.role-rotator').forEach(function(rotator) {
      var words = rotator.querySelectorAll('.role-rotator-word');
      if (words.length < 2) return;

      var oldWord = words[currentRoleIndex];
      var newWord = words[nextIndex];

      if (!animate) {
        words.forEach(function(w, idx) {
          var isActive = idx === nextIndex;
          w.classList.toggle('is-active', isActive);
          w.classList.remove('is-prev');
          w.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });
        return;
      }

      if (oldWord) {
        oldWord.classList.remove('is-active');
        oldWord.classList.add('is-prev');
        oldWord.setAttribute('aria-hidden', 'true');
        setTimeout(function() {
          oldWord.classList.remove('is-prev');
        }, 650);
      }

      if (newWord) {
        newWord.classList.remove('is-prev');
        newWord.classList.add('is-active');
        newWord.setAttribute('aria-hidden', 'false');
      }
    });

    currentRoleIndex = nextIndex;
    updateRotatorWidth(false);
  }

  function init() {
    applyLanguage(document.documentElement.lang || 'en');
    updateRotatorWidth(true);
    updateRotatorTitles();
    scheduleNextRoleSwap();

    document.querySelectorAll('.role-rotator').forEach(function(rotator) {
      rotator.addEventListener('click', function(e) {
        e.preventDefault();
        toggleRoleRotator();
      });
      rotator.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleRoleRotator();
        }
      });
    });

    var resumeBtn = document.querySelector('.resume-rotator-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resumeRoleRotator();
      });
    }

    document.addEventListener('visibilitychange', function() {
      if (!document.hidden && !isRotatorPaused) {
        scheduleNextRoleSwap();
      }
    });

    window.addEventListener('resize', function() {
      updateRotatorWidth(true);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        updateRotatorWidth(true);
      });
    }

    if (window.matchMedia) {
      var mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mql.addEventListener) {
        mql.addEventListener('change', function(e) {
          if (e.matches) {
            pauseRoleRotator();
            setRoleIndex(0, false);
            updateRotatorWidth(true);
          } else {
            resumeRoleRotator();
          }
        });
      }
    }

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
