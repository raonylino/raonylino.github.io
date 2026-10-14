(function () {
  const projetos = window.PROJETOS || [];
  const translations = window.PORTFOLIO_I18N || {};
  const english = translations.en || {};
  let language = localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'pt';

  function text(key) {
    return translations[language]?.ui?.[key] || key;
  }

  function localizedProject(projeto) {
    if (language !== 'en') return projeto;
    return { ...projeto, ...(english.projects?.[projeto.id] || {}) };
  }

  function applyTranslations() {
    document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR';

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      if (!Object.hasOwn(element.dataset, 'ptText')) element.dataset.ptText = element.textContent;
      const key = element.dataset.i18n;
      element.textContent = language === 'en' ? (english.ui?.[key] || element.dataset.ptText) : element.dataset.ptText;
    });

    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
      if (!Object.hasOwn(element.dataset, 'ptHtml')) element.dataset.ptHtml = element.innerHTML;
      const key = element.dataset.i18nHtml;
      element.innerHTML = language === 'en' ? (english.experience?.[key] || element.dataset.ptHtml) : element.dataset.ptHtml;
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      if (!Object.hasOwn(element.dataset, 'ptAriaLabel')) element.dataset.ptAriaLabel = element.getAttribute('aria-label') || '';
      const key = element.dataset.i18nAriaLabel;
      element.setAttribute('aria-label', language === 'en' ? (english.ui?.[key] || element.dataset.ptAriaLabel) : element.dataset.ptAriaLabel);
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      if (!Object.hasOwn(element.dataset, 'ptAlt')) element.dataset.ptAlt = element.getAttribute('alt') || '';
      const key = element.dataset.i18nAlt;
      element.setAttribute('alt', language === 'en' ? (english.ui?.[key] || element.dataset.ptAlt) : element.dataset.ptAlt);
    });

    document.querySelectorAll('[data-language]').forEach((button) => {
      const active = button.dataset.language === language;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const title = text('pageTitle');
    document.title = title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', text('pageDescription'));
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', text('pageDescription'));
  }

  function initLanguageSwitch() {
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.addEventListener('click', () => {
        language = button.dataset.language === 'en' ? 'en' : 'pt';
        localStorage.setItem('portfolio-language', language);
        applyTranslations();
        initTypewriter();
        renderFeaturedProjects();
        const activeFilter = document.querySelector('.filter-button.is-active')?.dataset.filter || 'all';
        renderProjectGrid(activeFilter);
        renderProjectDetail();
      });
    });
  }

  function setActiveFilter(filter) {
    const buttons = document.querySelectorAll('.filter-button');
    buttons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function createCardMarkup(projeto) {
    projeto = localizedProject(projeto);
    const tags = (projeto.tags || []).slice(0, 3).map((tag) => `<li>${tag}</li>`).join('');
    const media = projeto.capa
      ? `<img src="${projeto.capa}" alt="${projeto.titulo}" loading="lazy" />`
      : (window.gerarCapa ? window.gerarCapa(projeto) : '');

    return `
      <a class="project-card" href="projeto.html?id=${projeto.id}" aria-label="${text('cardDetails').replace('{title}', projeto.titulo)}">
        <div class="project-card__media">${media}</div>
        <div class="project-card__body">
          <div class="project-card__meta">
            <span>${projeto.categoria === 'mobile' ? text('mobile') : text('backend')}</span>
            <span class="arrow" aria-hidden="true">→</span>
          </div>
          <h3>${projeto.titulo}</h3>
          <p>${projeto.resumo}</p>
          <ul class="tag-list">${tags}</ul>
        </div>
      </a>
    `;
  }

  function renderFeaturedProjects() {
    const root = document.getElementById('featured-projects');
    if (!root) return;
    const featured = projetos.filter((projeto) => projeto.destaque).slice(0, 3);
    root.innerHTML = featured.map(createCardMarkup).join('');
  }

  function renderProjectGrid(filter) {
    const root = document.getElementById('project-grid');
    if (!root) return;

    const filtered = filter === 'all'
      ? projetos
      : projetos.filter((projeto) => projeto.categoria === filter);

    root.innerHTML = filtered.map(createCardMarkup).join('');
  }

  function initFilters() {
    const buttons = document.querySelectorAll('.filter-button');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter || 'all';
        setActiveFilter(filter);
        renderProjectGrid(filter);
      });
    });
  }

  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initTypewriter() {
    const el = document.querySelector('[data-typewriter]');
    if (!el) return;

    clearTimeout(window.portfolioTypewriterTimer);
    const phrases = language === 'en'
      ? ['Flutter', 'C# / .NET', 'REST APIs', 'Clean Architecture']
      : ['Flutter', 'C# / .NET', 'APIs REST', 'Clean Architecture'];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      el.textContent = 'Flutter';
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex += 1;
      } else {
        charIndex -= 1;
      }

      el.textContent = current.slice(0, charIndex);

      if (!deleting && charIndex === current.length) {
        deleting = true;
        window.portfolioTypewriterTimer = setTimeout(tick, 1200);
        return;
      }

      if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }

      const speed = deleting ? 55 : 110;
      window.portfolioTypewriterTimer = setTimeout(tick, speed);
    }

    tick();
  }

  function initCurriculoButton() {
    const button = document.getElementById('curriculo-btn');
    if (!button) return;

    fetch('assets/doc/Curriculo_Raony.pdf')
      .then((response) => {
        if (!response.ok) {
          button.classList.add('hidden');
        }
      })
      .catch(() => {
        button.classList.add('hidden');
      });
  }

  function renderProjectDetail() {
    const root = document.getElementById('project-detail-root');
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const sourceProject = projetos.find((item) => item.id === id);

    if (!sourceProject) {
      document.title = `${text('notFoundTitle')} | Raony Lino`;
      root.innerHTML = `
        <div class="empty-state">
          <h1>${text('notFoundTitle')}</h1>
          <p>${text('notFoundText')}</p>
          <a class="button button-primary" href="index.html#projetos">${text('backHome')}</a>
        </div>
      `;
      return;
    }

    const projeto = localizedProject(sourceProject);
    const title = `${projeto.titulo} | Raony Lino`;
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', projeto.resumo);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', projeto.resumo);

    const index = projetos.indexOf(sourceProject);
    const prev = index > 0 ? projetos[index - 1] : null;
    const next = index < projetos.length - 1 ? projetos[index + 1] : null;

    const cover = projeto.capa ? `<img src="${projeto.capa}" alt="${projeto.titulo}" />` : (window.gerarCapa ? window.gerarCapa(projeto) : '');

    const sections = [];
    if (projeto.oQueFaz && projeto.oQueFaz.length) {
      sections.push(`
        <section class="detail-section">
          <h2>${text('detailWhatItDoes')}</h2>
          <ul>${projeto.oQueFaz.map((item) => `<li>${item}</li>`).join('')}</ul>
        </section>
      `);
    }

    if (projeto.tecnologias && projeto.tecnologias.length) {
      sections.push(`
        <section class="detail-section">
          <h2>${text('detailTechnologies')}</h2>
          <ul class="detail-techs">${projeto.tecnologias.map((item) => `<li>${item}</li>`).join('')}</ul>
        </section>
      `);
    }

    if (projeto.arquitetura) {
      sections.push(`
        <section class="detail-section">
          <h2>${text('detailArchitecture')}</h2>
          <p>${projeto.arquitetura}</p>
        </section>
      `);
    }

    if (projeto.comoFunciona && projeto.comoFunciona.length) {
      sections.push(`
        <section class="detail-section">
          <h2>${text('detailHowItWorks')}</h2>
          <ol>${projeto.comoFunciona.map((item) => `<li>${item}</li>`).join('')}</ol>
        </section>
      `);
    }

    if (projeto.desafios) {
      sections.push(`
        <section class="detail-section">
          <h2>${text('detailChallenges')}</h2>
          <p>${projeto.desafios}</p>
        </section>
      `);
    }

    if (projeto.proximosPassos && projeto.proximosPassos.length) {
      sections.push(`
        <section class="detail-section">
          <h2>${text('detailNextSteps')}</h2>
          <ul>${projeto.proximosPassos.map((item) => `<li>${item}</li>`).join('')}</ul>
        </section>
      `);
    }

    root.innerHTML = `
      <a class="back-link" href="index.html#projetos">${text('detailBack')}</a>
      <article class="project-detail">
        <header class="detail-header">
          <div>
            <p class="project-detail__eyebrow">${projeto.categoria === 'mobile' ? text('detailCategoryMobile') : text('detailCategoryBackend')}</p>
            <h1>${projeto.titulo}</h1>
          </div>
          <div class="detail-actions">
            ${projeto.github ? `<a class="button button-primary" href="${projeto.github}" target="_blank" rel="noopener">${text('detailGithub')}</a>` : ''}
            ${projeto.site ? `<a class="button button-secondary" href="${projeto.site}" target="_blank" rel="noopener">${text('detailSite')}</a>` : ''}
          </div>
        </header>
        <div class="project-detail__cover">${cover}</div>
        <div class="project-detail__content">
          <div class="project-detail__summary">${projeto.resumo}</div>
          ${sections.join('')}
        </div>
        <nav class="project-detail__nav" aria-label="${text('detailNavLabel')}">
          ${prev ? `<a href="projeto.html?id=${prev.id}">${text('previousProject')}</a>` : '<span></span>'}
          ${next ? `<a href="projeto.html?id=${next.id}">${text('nextProject')}</a>` : '<span></span>'}
        </nav>
      </article>
    `;
  }

  function init() {
    applyTranslations();
    initLanguageSwitch();
    initNav();
    initTypewriter();
    initCurriculoButton();
    renderFeaturedProjects();
    initFilters();
    renderProjectGrid('all');
    renderProjectDetail();
  }

  init();
})();
