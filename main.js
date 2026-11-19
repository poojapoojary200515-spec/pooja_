/**
 * ==========================================================================
 * POOJA - DEVELOPER PORTFOLIO
 * Main JavaScript Interactions & State Management
 * Includes: Theme Toggle, Mobile Drawer, Active Scroll Spy, Project/Skill Filters,
 *           Copy Clipboard Helpers, Toast Notifications, and Resume Modal.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initScrollSpy();
  initProjectFiltering();
  initSkillFiltering();
  initCopyButtons();
  initContactForm();
  initResumeModal();
  initCertificateLightbox();
  initBackToTop();
});

/* --------------------------------------------------------------------------
 * 1. THEME TOGGLE (Default: Light Theme, Persisted in LocalStorage)
 * -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or default to 'light' per design requirements
  const savedTheme = localStorage.getItem('pooja_portfolio_theme') || 'light';
  applyTheme(savedTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      htmlRoot.setAttribute('data-theme', 'dark');
      localStorage.setItem('pooja_portfolio_theme', 'dark');
      updateThemeAria('Switch to light theme');
    } else {
      htmlRoot.removeAttribute('data-theme');
      localStorage.setItem('pooja_portfolio_theme', 'light');
      updateThemeAria('Switch to dark theme');
    }
  }

  function updateThemeAria(label) {
    themeToggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    });
  }
}

/* --------------------------------------------------------------------------
 * 2. NAVIGATION & MOBILE DRAWER
 * -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.mobile-drawer-backdrop');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  // Sticky header background enhancement on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Open drawer
  function openDrawer() {
    drawer?.classList.add('open');
    backdrop?.classList.add('open');
    toggleBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  // Close drawer
  function closeDrawer() {
    drawer?.classList.remove('open');
    backdrop?.classList.remove('open');
    toggleBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn?.addEventListener('click', () => {
    const isOpen = drawer?.classList.contains('open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  // Close when pressing ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Close when clicking mobile nav links
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* --------------------------------------------------------------------------
 * 3. ACTIVE SCROLL SPY (IntersectionObserver)
 * -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-links .nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

  if (!sections.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        setActiveLink(id);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  function setActiveLink(activeId) {
    desktopNavLinks.forEach(link => {
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    mobileNavLinks.forEach(link => {
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

/* --------------------------------------------------------------------------
 * 4. PROJECT FILTERING TABS
 * -------------------------------------------------------------------------- */
function initProjectFiltering() {
  const filterBtns = document.querySelectorAll('.projects-filter-bar .filter-btn');
  const projectCards = document.querySelectorAll('[data-project-category]');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter') || 'all';

      projectCards.forEach(card => {
        const categories = (card.getAttribute('data-project-category') || '').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = '';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
          }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
 * 5. SKILL CATEGORY FILTERING / TABS
 * -------------------------------------------------------------------------- */
function initSkillFiltering() {
  const skillTabs = document.querySelectorAll('.skills-nav-tabs .skill-tab-btn');
  const skillGroups = document.querySelectorAll('.skills-category-group');

  if (!skillTabs.length) return;

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetCategory = tab.getAttribute('data-skill-category');

      skillGroups.forEach(group => {
        const groupCategory = group.getAttribute('data-category-id');
        if (targetCategory === 'all' || groupCategory === targetCategory) {
          group.style.display = '';
          group.style.opacity = '0';
          setTimeout(() => {
            group.style.transition = 'opacity 0.3s ease';
            group.style.opacity = '1';
          }, 10);
        } else {
          group.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
 * 6. COPY TO CLIPBOARD HELPER
 * -------------------------------------------------------------------------- */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy') || '';
      const label = btn.getAttribute('data-copy-label') || 'Text';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }

        showToast(`Copied ${label} to clipboard!`);

        // Visual feedback on button
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg> Copied!
        `;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 2000);
      } catch (err) {
        showToast(`Could not copy: ${textToCopy}`);
      }
    });
  });
}

/* --------------------------------------------------------------------------
 * 7. CONTACT FORM (Interactive mailto link constructor + feedback)
 * -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('sender-name');
    const emailInput = document.getElementById('sender-email');
    const subjectInput = document.getElementById('sender-subject');
    const messageInput = document.getElementById('sender-message');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim() || 'Portfolio Inquiry / Opportunity';
    const message = messageInput.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill out all required fields.');
      return;
    }

    // Construct mailto link
    const recipient = 'poojapoojary200515@gmail.com';
    const mailtoSubject = encodeURIComponent(`[Portfolio Contact] ${subject} - from ${name}`);
    const mailtoBody = encodeURIComponent(
      `Hello Pooja,\n\n${message}\n\n---\nSender: ${name}\nEmail: ${email}\nSent via Pooja's Developer Portfolio`
    );

    const mailtoUrl = `mailto:${recipient}?subject=${mailtoSubject}&body=${mailtoBody}`;

    showToast('Opening your email client to send message...');

    // Small delay so user sees toast before redirect
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 450);

    form.reset();
  });
}

/* --------------------------------------------------------------------------
 * 8. RESUME MODAL & PRINT HANDLER
 * -------------------------------------------------------------------------- */
function initResumeModal() {
  const openBtns = document.querySelectorAll('.open-resume-modal');
  const modal = document.getElementById('resume-modal');
  const closeBtn = modal?.querySelector('.modal-close-btn');
  const printBtn = document.getElementById('btn-print-resume');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  }));

  closeBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  printBtn?.addEventListener('click', () => {
    // Open printable resume in new tab
    window.open('resume.html', '_blank');
  });
}

/* --------------------------------------------------------------------------
 * 9. BACK TO TOP BUTTON
 * -------------------------------------------------------------------------- */
function initBackToTop() {
  const backBtn = document.querySelector('.back-to-top');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* --------------------------------------------------------------------------
 * 11. CERTIFICATE LIGHTBOX PREVIEW
 * -------------------------------------------------------------------------- */
function initCertificateLightbox() {
  const triggerBtns = document.querySelectorAll('.open-cert-lightbox');
  const modal = document.getElementById('certificate-lightbox');
  const closeBtn = document.getElementById('close-cert-lightbox');
  const imgElem = document.getElementById('cert-lightbox-image');
  const titleElem = document.getElementById('cert-lightbox-title');
  const issuerElem = document.getElementById('cert-lightbox-issuer');
  const downloadLink = document.getElementById('cert-download-link');

  if (!modal) return;

  function openLightbox(imgSrc, title, issuer) {
    if (imgElem) imgElem.src = imgSrc;
    if (titleElem) titleElem.textContent = title || 'Certificate Preview';
    if (issuerElem) issuerElem.innerHTML = issuer || '';
    if (downloadLink) {
      downloadLink.href = imgSrc;
      downloadLink.setAttribute('download', (title || 'certificate').replace(/[^a-zA-Z0-9]/g, '_') + '.jpg');
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const imgSrc = btn.getAttribute('data-cert-img');
      const title = btn.getAttribute('data-cert-title');
      const issuer = btn.getAttribute('data-cert-issuer');
      if (imgSrc) {
        openLightbox(imgSrc, title, issuer);
      }
    });
  });

  closeBtn?.addEventListener('click', closeLightbox);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeLightbox();
    }
  });
}
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove after 3.2 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 3200);
}
