(function() {
  function safeGetStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function getPreferredLanguage() {
    var stored = safeGetStorage('lang');
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
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

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

    document.querySelectorAll('.role-rotator').forEach(function(rotator) {
      var title = isHu ? rotator.getAttribute('data-title-hu') : rotator.getAttribute('data-title-en');
      if (title) {
        rotator.setAttribute('title', title);
      }
      var activeWord = rotator.querySelector('.role-rotator-word.is-active');
      if (activeWord) {
        var activeText = (activeWord.innerText || activeWord.textContent || '').trim();
        if (activeText) {
          rotator.setAttribute('aria-label', activeText);
        }
      }
    });

    document.querySelectorAll('.code-copy-btn').forEach(function(btn) {
      var isCopied = btn.classList.contains('is-copied');
      if (isCopied) {
        btn.setAttribute('aria-label', isHu ? 'Másolva a vágólapra' : 'Copied to clipboard');
      } else {
        btn.setAttribute('aria-label', isHu ? 'Kód másolása a vágólapra' : 'Copy code to clipboard');
      }
    });

    updateRotatorWidth(true);
  }

  var currentRoleIndex = 0;
  var isSwapping = false;
  var hasInteracted = false;
  var wiggleFallbackTimer = null;

  function stopHandleWiggle() {
    hasInteracted = true;
    if (wiggleFallbackTimer) {
      clearTimeout(wiggleFallbackTimer);
      wiggleFallbackTimer = null;
    }
    var handle = document.querySelector('.avatar-handle');
    if (handle) {
      handle.classList.remove('is-wiggling');
    }
  }

  function triggerHandleWiggle() {
    if (hasInteracted) return;
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    var handle = document.querySelector('.avatar-handle');
    if (handle) {
      handle.classList.add('is-wiggling');
      var removeWiggle = function() {
        handle.classList.remove('is-wiggling');
        handle.removeEventListener('animationend', removeWiggle);
      };
      handle.addEventListener('animationend', removeWiggle);
      wiggleFallbackTimer = setTimeout(function() {
        handle.classList.remove('is-wiggling');
      }, 25000);
    }
  }

  function startScrollBounce() {
    var scrollArrow = document.querySelector('.scroll-arrow');
    if (scrollArrow && !scrollArrow.classList.contains('is-bouncing')) {
      scrollArrow.classList.add('is-bouncing');
    }
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve, reject) {
      try {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        var success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (success) {
          resolve();
        } else {
          reject(new Error('execCommand copy failed'));
        }
      } catch (err) {
        reject(err);
      }
    });
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
          if (isActive) {
            var activeText = (w.innerText || w.textContent || '').trim();
            if (activeText) {
              rotator.setAttribute('aria-label', activeText);
            }
          }
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
        var newText = (newWord.innerText || newWord.textContent || '').trim();
        if (newText) {
          rotator.setAttribute('aria-label', newText);
        }
      }
    });

    currentRoleIndex = nextIndex;
    updateRotatorWidth(false);
  }

  function swapAvatarAndRole() {
    if (isSwapping) return;
    isSwapping = true;

    var avatarBtn = document.querySelector('.profile-avatar');
    if (!avatarBtn) {
      isSwapping = false;
      return;
    }

    var currentActive = avatarBtn.getAttribute('data-active') || 'real';
    var nextActive = currentActive === 'real' ? 'mc' : 'real';
    var nextRoleIndex = nextActive === 'real' ? 0 : 1;

    avatarBtn.classList.add('is-animating');
    var handle = avatarBtn.querySelector('.avatar-handle');
    if (handle) {
      handle.classList.remove('is-wiggling');
    }

    setTimeout(function() {
      avatarBtn.setAttribute('data-active', nextActive);
    }, 150);

    // Start text roll animation right after the image animation settles
    setTimeout(function() {
      avatarBtn.classList.remove('is-animating');
      setRoleIndex(nextRoleIndex, true);
    }, 400);

    setTimeout(function() {
      isSwapping = false;
    }, 850);
  }

  function init() {
    applyLanguage(document.documentElement.lang || 'en');

    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var avatarBtn = document.querySelector('.profile-avatar');
    if (avatarBtn) {
      if (canHover) {
        avatarBtn.addEventListener('mouseenter', stopHandleWiggle);
      }
      avatarBtn.addEventListener('focus', stopHandleWiggle);
      avatarBtn.addEventListener('click', function(e) {
        e.preventDefault();
        stopHandleWiggle();
        swapAvatarAndRole();
      });
    }

    document.querySelectorAll('.role-rotator').forEach(function(rotator) {
      if (canHover) {
        rotator.addEventListener('mouseenter', stopHandleWiggle);
      }
      rotator.addEventListener('click', function(e) {
        e.preventDefault();
        stopHandleWiggle();
        swapAvatarAndRole();
      });
      rotator.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          stopHandleWiggle();
          swapAvatarAndRole();
        }
      });
    });

    // Subtle handle wiggle hint at load (repeats 6 times) if hero avatar exists
    if (document.querySelector('.avatar-handle')) {
      setTimeout(triggerHandleWiggle, 1400);
    }

    // Scroll arrow bouncing starts after 3s if scroll arrow exists
    if (document.querySelector('.scroll-arrow')) {
      setTimeout(startScrollBounce, 3000);
    }

    window.addEventListener('resize', function() {
      updateRotatorWidth(true);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        updateRotatorWidth(true);
      });
    }

    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetLang = this.getAttribute('data-lang-target');
        if (targetLang) {
          safeSetStorage('lang', targetLang);
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
        copyTextToClipboard(text).then(function() {
          btn.classList.add('is-copied');
          var isHu = document.documentElement.lang === 'hu';
          btn.setAttribute('aria-label', isHu ? 'Másolva a vágólapra' : 'Copied to clipboard');
          if (btn._copyTimeout) clearTimeout(btn._copyTimeout);
          btn._copyTimeout = setTimeout(function() {
            btn.classList.remove('is-copied');
            var currentIsHu = document.documentElement.lang === 'hu';
            btn.setAttribute('aria-label', currentIsHu ? 'Kód másolása a vágólapra' : 'Copy code to clipboard');
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
