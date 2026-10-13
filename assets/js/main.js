(function () {
  const projetos = window.PROJETOS || [];

  function setActiveFilter(filter) {
    const buttons = document.querySelectorAll('.filter-button');
    buttons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function createCardMarkup(projeto) {
    const tags = (projeto.tags || []).slice(0, 3).map((tag) => `<li>${tag}</li>`).join('');
    const media = projeto.capa
      ? `<img src="${projeto.capa}" alt="${projeto.titulo}" loading="lazy" />`
      : (window.gerarCapa ? window.gerarCapa(projeto) : '');

    return `
      <a class="project-card" href="projeto.html?id=${projeto.id}" aria-label="Ver detalhes do projeto ${projeto.titulo}">
        <div class="project-card__media">${media}</div>
        <div class="project-card__body">
          <div class="project-card__meta">
            <span>${projeto.categoria === 'mobile' ? 'Mobile' : 'Backend'}</span>
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

    const phrases = ['Flutter', 'C# / .NET', 'APIs REST', 'Clean Architecture'];
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
        setTimeout(tick, 1200);
        return;
      }

      if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }

      const speed = deleting ? 55 : 110;
      setTimeout(tick, speed);
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
    const projeto = projetos.find((item) => item.id === id);

    if (!projeto) {
      document.title = 'Projeto não encontrado | Raony Lino';
      root.innerHTML = `
        <div class="empty-state">
          <h1>Projeto não encontrado</h1>
          <p>O projeto solicitado não está disponível no momento.</p>
          <a class="button button-primary" href="index.html#projetos">Voltar aos projetos</a>
        </div>
      `;
      return;
    }

    const title = `${projeto.titulo} | Raony Lino`;
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', projeto.resumo);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', projeto.resumo);

    const index = projetos.indexOf(projeto);
    const prev = index > 0 ? projetos[index - 1] : null;
    const next = index < projetos.length - 1 ? projetos[index + 1] : null;

    const cover = projeto.capa ? `<img src="${projeto.capa}" alt="${projeto.titulo}" />` : (window.gerarCapa ? window.gerarCapa(projeto) : '');

    const sections = [];
    if (projeto.oQueFaz && projeto.oQueFaz.length) {
      sections.push(`
        <section class="detail-section">
          <h2>O que o projeto faz</h2>
          <ul>${projeto.oQueFaz.map((item) => `<li>${item}</li>`).join('')}</ul>
        </section>
      `);
    }

    if (projeto.tecnologias && projeto.tecnologias.length) {
      sections.push(`
        <section class="detail-section">
          <h2>Tecnologias</h2>
          <ul class="detail-techs">${projeto.tecnologias.map((item) => `<li>${item}</li>`).join('')}</ul>
        </section>
      `);
    }

    if (projeto.arquitetura) {
      sections.push(`
        <section class="detail-section">
          <h2>Arquitetura</h2>
          <p>${projeto.arquitetura}</p>
        </section>
      `);
    }

    if (projeto.comoFunciona && projeto.comoFunciona.length) {
      sections.push(`
        <section class="detail-section">
          <h2>Como funciona</h2>
          <ol>${projeto.comoFunciona.map((item) => `<li>${item}</li>`).join('')}</ol>
        </section>
      `);
    }

    if (projeto.desafios) {
      sections.push(`
        <section class="detail-section">
          <h2>Desafios e aprendizados</h2>
          <p>${projeto.desafios}</p>
        </section>
      `);
    }

    if (projeto.proximosPassos && projeto.proximosPassos.length) {
      sections.push(`
        <section class="detail-section">
          <h2>Próximos passos</h2>
          <ul>${projeto.proximosPassos.map((item) => `<li>${item}</li>`).join('')}</ul>
        </section>
      `);
    }

    root.innerHTML = `
      <a class="back-link" href="index.html#projetos">← Voltar aos projetos</a>
      <article class="project-detail">
        <header class="detail-header">
          <div>
            <p class="project-detail__eyebrow">${projeto.categoria === 'mobile' ? 'Mobile' : 'Backend'}</p>
            <h1>${projeto.titulo}</h1>
          </div>
          <div class="detail-actions">
            ${projeto.github ? `<a class="button button-primary" href="${projeto.github}" target="_blank" rel="noopener">Ver código no GitHub</a>` : ''}
            ${projeto.site ? `<a class="button button-secondary" href="${projeto.site}" target="_blank" rel="noopener">Ver site/app</a>` : ''}
          </div>
        </header>
        <div class="project-detail__cover">${cover}</div>
        <div class="project-detail__content">
          <div class="project-detail__summary">${projeto.resumo}</div>
          ${sections.join('')}
        </div>
        <nav class="project-detail__nav" aria-label="Navegação de projetos">
          ${prev ? `<a href="projeto.html?id=${prev.id}">← Projeto anterior</a>` : '<span></span>'}
          ${next ? `<a href="projeto.html?id=${next.id}">Próximo projeto →</a>` : '<span></span>'}
        </nav>
      </article>
    `;
  }

  function init() {
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
