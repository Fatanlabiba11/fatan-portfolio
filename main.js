/**
 * Fatan Portfolio — Main Script
 * Handles: navigation, scroll reveal, modal, lazy loading
 */

(function () {
  'use strict';

  /* ---- DOM REFERENCES ---------------------------------- */
  const nav = document.querySelector('.nav');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('nav-mobile');
  const mobileLinks = mobileNav.querySelectorAll('.nav__mobile-link');
  const projectsGrid = document.getElementById('projects-grid');
  const certsGrid = document.getElementById('certificates-grid');
  const modalOverlay = document.getElementById('cert-modal');
  const modalClose = document.getElementById('modal-close');

  /* ---- MOBILE NAV -------------------------------------- */
  function toggleMobileNav() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    mobileNav.classList.toggle('is-open', !isOpen);
    mobileNav.setAttribute('aria-hidden', String(isOpen));
    if (nav) nav.classList.toggle('is-open', !isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMobileNav);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
      if (nav) nav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileNav.classList.contains('is-open')) {
        toggleMobileNav();
        hamburger.focus();
      }
      if (modalOverlay.classList.contains('is-open')) {
        closeModal();
      }
    }
  });

  /* ---- SCROLL REVEAL ----------------------------------- */
  function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  /* ---- RENDER PROJECTS --------------------------------- */
  function renderProjects() {
    if (typeof PROJECTS === 'undefined') return;

    projectsGrid.innerHTML = PROJECTS.map(project => `
      <article class="project-card reveal" id="project-${project.id}">
        <div class="project-card__image-wrapper">
          ${project.image
            ? `<img class="project-card__image" src="${project.image}" alt="Screenshot of ${project.name}" loading="lazy" />`
            : `<div class="project-card__placeholder"><span class="project-card__placeholder-text">Screenshot coming soon</span></div>`
          }
        </div>
        <div class="project-card__body">
          <h3 class="project-card__name">${project.name}</h3>
          <p class="project-card__description">${project.description}</p>
          <div class="project-card__tech">
            ${project.tech.map(t => `<span class="project-card__tech-tag">${t}</span>`).join('')}
          </div>
          <a href="${project.link}" class="project-card__link" ${project.link !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>
            View project <span aria-hidden="true">→</span>
          </a>
        </div>
      </article>
    `).join('');
  }

  /* ---- RENDER CERTIFICATES ----------------------------- */
  function renderCertificates() {
    if (typeof CERTIFICATES === 'undefined') return;

    certsGrid.innerHTML = CERTIFICATES.map(cert => `
      <button
        class="cert-card reveal"
        id="cert-${cert.id}"
        aria-label="View certificate: ${cert.name}"
        data-cert-name="${cert.name}"
        data-cert-provider="${cert.provider}"
        data-cert-year="${cert.year}"
        data-cert-link="${cert.link}"
        data-cert-image="${cert.image || ''}"
      >
        <span class="cert-card__provider">${cert.provider}</span>
        <span class="cert-card__name">${cert.name}</span>
        <span class="cert-card__footer">
          <span class="cert-card__year">${cert.year}</span>
          <span class="cert-card__view">View <span aria-hidden="true">→</span></span>
        </span>
      </button>
    `).join('');

    // Attach click handlers
    certsGrid.querySelectorAll('.cert-card').forEach(card => {
      card.addEventListener('click', () => openModal(card));
    });
  }

  /* ---- CERTIFICATE MODAL ------------------------------- */
  let lastFocusedElement = null;

  function openModal(cardEl) {
    lastFocusedElement = cardEl;

    document.getElementById('modal-provider').textContent = cardEl.dataset.certProvider;
    document.getElementById('modal-name').textContent = cardEl.dataset.certName;
    document.getElementById('modal-year').textContent = cardEl.dataset.certYear;

    const viewLink = document.getElementById('modal-view-link');
    const image = cardEl.dataset.certImage;
    const link = cardEl.dataset.certLink;
    
    // Prioritize the image link, fallback to the external link
    const targetUrl = image || link;
    
    if (targetUrl && targetUrl !== '#') {
      viewLink.href = targetUrl;
      viewLink.style.display = 'inline-flex';
    } else {
      viewLink.style.display = 'none';
    }

    const modalImage = document.getElementById('modal-image');
    if (image) {
      modalImage.src = image;
      modalImage.style.display = 'block';
    } else {
      modalImage.style.display = 'none';
      modalImage.src = '';
    }

    modalOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  /* ---- SMOOTH SCROLL FOR NAV LINKS --------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 52;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- SCROLL EFFECTS (NAV & PARALLAX) ----------------- */
  function initScrollEffects() {
    const nav = document.querySelector('.nav');
    const heroImage = document.querySelector('.hero__image');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isMobile = window.innerWidth < 768;

    window.addEventListener('resize', () => {
      isMobile = window.innerWidth < 768;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      
      // Navbar dynamic background
      if (scrollY > 20) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }

      // Subtle Hero Parallax (disable on mobile or reduced motion)
      if (prefersReducedMotion || isMobile) {
        if (heroImage) heroImage.style.transform = 'none';
      } else if (scrollY < window.innerHeight && heroImage) {
        // Max movement ~20px
        const yPos = Math.min(scrollY * 0.04, 20);
        heroImage.style.transform = `translateY(${yPos}px)`;
      }
    }, { passive: true });
  }

  /* ---- STAGGER DELAYS ----------------------------------- */
  function applyStagger(container, selector) {
    const items = container.querySelectorAll(selector);
    items.forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`;
    });
  }

  /* ---- INIT -------------------------------------------- */
  renderProjects();
  renderCertificates();
  applyStagger(projectsGrid, '.project-card');
  applyStagger(certsGrid, '.cert-card');
  initScrollReveal();
  initScrollEffects();
})();
