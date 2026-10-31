// jabbott.dev — small progressive enhancements. Every page works without this file.
(() => {
  'use strict';

  const root = document.documentElement;
  const SITE_URL = (root.dataset.siteUrl || location.origin).replace(/\/$/, '');
  const GITHUB_USER = root.dataset.github || 'jabbott-iii';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const session = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch { /* storage unavailable */ } },
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // ---------- Mobile navigation ----------
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
  }

  // ---------- Deployments: menu + live discovery from GitHub ----------
  const DEPLOY_CACHE = 'jabbott:deployments:v1';
  const DEPLOY_TTL = 60 * 60 * 1000;
  let deploySync = null;

  const pagesUrl = (repo) => {
    const home = (repo.homepage || '').trim();
    if (/^https?:\/\//i.test(home) && !/github\.com/i.test(home)) return home;
    return `${SITE_URL}/${repo.name}/`;
  };

  const fetchDeployments = async () => {
    const cached = session.get(DEPLOY_CACHE);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (Date.now() - data.time < DEPLOY_TTL) return data.repos;
      } catch { /* ignore a bad cache entry */ }
    }
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const self = `${GITHUB_USER}.github.io`.toLowerCase();
    const repos = (await res.json())
      .filter((r) => r.has_pages && !r.fork && !r.archived && r.name.toLowerCase() !== self)
      .map((r) => ({
        name: r.name,
        repo: r.full_name,
        url: pagesUrl(r),
        summary: r.description || '',
        language: r.language || '',
      }));
    session.set(DEPLOY_CACHE, JSON.stringify({ time: Date.now(), repos }));
    return repos;
  };

  const renderDeployItem = (d) => {
    const li = el('li', 'deploy-item deploy-item--new');
    li.dataset.deployRepo = d.repo.toLowerCase();
    const link = el('a', 'deploy-item__link');
    link.href = d.url;
    link.target = '_blank';
    link.rel = 'noopener';
    const dot = el('span', 'status-dot');
    dot.setAttribute('aria-hidden', 'true');
    link.append(dot, el('span', 'deploy-item__name', d.name), el('span', 'deploy-item__host', d.url.replace(/^https?:\/\//, '')));
    const repo = el('a', 'deploy-item__repo');
    const icon = document.querySelector('.deploy-item__repo svg');
    if (icon) repo.append(icon.cloneNode(true));
    else repo.textContent = 'Git';
    repo.href = `https://github.com/${d.repo}`;
    repo.target = '_blank';
    repo.rel = 'noopener';
    repo.setAttribute('aria-label', `${d.name} repository on GitHub`);
    li.append(link, repo);
    return li;
  };

  const renderDeployCard = (d) => {
    const card = el('article', 'deploy-card panel panel--brackets');
    card.dataset.deployRepo = d.repo.toLowerCase();
    const kicker = el('p', 'kicker');
    const dot = el('span', 'status-dot');
    dot.setAttribute('aria-hidden', 'true');
    kicker.append(dot, ` Online // ${d.language || 'Web'}`);
    const actions = el('div', 'btn-row');
    const launch = el('a', 'btn btn--amber btn--sm', 'Launch');
    launch.href = d.url;
    launch.target = '_blank';
    launch.rel = 'noopener';
    const repo = el('a', 'btn btn--ghost btn--sm', 'Repository');
    repo.href = `https://github.com/${d.repo}`;
    repo.target = '_blank';
    repo.rel = 'noopener';
    actions.append(launch, repo);
    card.append(
      kicker,
      el('h2', 'deploy-card__title', d.name),
      el('p', 'deploy-card__url', d.url.replace(/^https?:\/\//, '')),
      el('p', 'deploy-card__text', d.summary || 'Deployed with GitHub Pages.'),
      actions,
    );
    return card;
  };

  const setDeployStatus = (text) => {
    document.querySelectorAll('[data-deploy-status]').forEach((node) => {
      node.textContent = text;
      node.hidden = !text;
    });
  };

  const syncDeployments = () => {
    if (deploySync) return deploySync;
    setDeployStatus('Checking GitHub for live Pages sites…');
    deploySync = fetchDeployments()
      .then((repos) => {
        const known = new Set([...document.querySelectorAll('[data-deploy-repo]')].map((n) => n.dataset.deployRepo));
        let added = 0;
        repos.forEach((d) => {
          if (known.has(d.repo.toLowerCase())) return;
          added += 1;
          document.querySelectorAll('[data-deploy-list]').forEach((list) => list.append(renderDeployItem(d)));
          document.querySelectorAll('[data-deploy-grid]').forEach((grid) => grid.append(renderDeployCard(d)));
        });
        const total = known.size + added;
        const noun = total === 1 ? 'deployment' : 'deployments';
        setDeployStatus(`${total} live ${noun} · synced with GitHub${added ? ` (${added} found just now)` : ''}`);
      })
      .catch(() => {
        setDeployStatus('GitHub could not be reached, so this is the saved list.');
        deploySync = null;
      });
    return deploySync;
  };

  const deploy = document.querySelector('[data-deploy]');
  if (deploy) {
    const toggle = deploy.querySelector('[data-deploy-toggle]');
    const panel = deploy.querySelector('[data-deploy-panel]');
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-haspopup', 'true');
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (open) syncDeployments();
    };
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(panel.hidden);
    });
    toggle.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        setOpen(panel.hidden);
      }
    });
    document.addEventListener('click', (event) => {
      if (!panel.hidden && !deploy.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) {
        setOpen(false);
        toggle.focus();
      }
    });
  }
  if (document.querySelector('[data-deploy-grid]')) syncDeployments();

  // ---------- Hero carousel ----------
  const hero = document.querySelector('[data-carousel]');
  if (hero) {
    const slides = [...hero.querySelectorAll('.hero__slide')];
    const bars = [...hero.querySelectorAll('.hero__bar')];
    let current = 0;
    const show = (index, focusBar) => {
      current = (index + slides.length) % slides.length;
      hero.classList.add('has-moved');
      slides.forEach((slide, i) => {
        const on = i === current;
        slide.hidden = !on;
        slide.classList.toggle('is-active', on);
      });
      bars.forEach((bar, i) => {
        const on = i === current;
        bar.classList.toggle('is-active', on);
        bar.setAttribute('aria-selected', String(on));
        bar.tabIndex = on ? 0 : -1;
      });
      if (focusBar) bars[current].focus();
    };
    bars.forEach((bar, i) => {
      bar.addEventListener('click', () => show(i));
      bar.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1, true); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1, true); }
      });
      bar.tabIndex = i === 0 ? 0 : -1;
    });
    if (!reduceMotion && slides.length > 1) {
      hero.classList.add('is-auto');
      bars.forEach((bar) => bar.addEventListener('animationend', () => {
        if (bar.classList.contains('is-active')) show(current + 1);
      }));
      const pause = () => hero.classList.add('is-paused');
      const resume = () => hero.classList.remove('is-paused');
      hero.addEventListener('mouseenter', pause);
      hero.addEventListener('mouseleave', resume);
      hero.addEventListener('focusin', pause);
      hero.addEventListener('focusout', resume);
    }
  }

  // ---------- Log filters, search and "load more" ----------
  const grid = document.querySelector('[data-cards]');
  if (grid) {
    const PAGE_SIZE = 12;
    const cards = [...grid.querySelectorAll('.card')];
    const chips = [...document.querySelectorAll('[data-filter]')];
    const search = document.querySelector('[data-search]');
    const empty = document.querySelector('[data-empty]');
    const more = document.querySelector('[data-more]');
    const reset = document.querySelector('[data-reset]');
    const params = new URLSearchParams(location.search);
    let filter = params.get('project') || 'all';
    let limit = PAGE_SIZE;
    if (!chips.some((chip) => chip.dataset.filter === filter)) filter = 'all';
    if (search && params.get('q')) search.value = params.get('q');

    const syncUrl = () => {
      const next = new URLSearchParams();
      if (filter !== 'all') next.set('project', filter);
      const q = search ? search.value.trim() : '';
      if (q) next.set('q', q);
      const query = next.toString();
      history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
    };

    const apply = () => {
      const q = search ? search.value.trim().toLowerCase() : '';
      let matched = 0;
      cards.forEach((card) => {
        const ok = (filter === 'all' || card.dataset.project === filter) && (!q || card.dataset.text.includes(q));
        if (ok) matched += 1;
        card.hidden = !(ok && matched <= limit);
      });
      chips.forEach((chip) => {
        const on = chip.dataset.filter === filter;
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-pressed', String(on));
      });
      if (empty) empty.hidden = matched !== 0;
      if (more) more.hidden = matched <= limit;
    };

    chips.forEach((chip) => chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      limit = PAGE_SIZE;
      apply();
      syncUrl();
    }));
    if (search) {
      search.addEventListener('input', () => { limit = PAGE_SIZE; apply(); syncUrl(); });
    }
    if (more) more.addEventListener('click', () => { limit += PAGE_SIZE; apply(); });
    if (reset) reset.addEventListener('click', () => {
      filter = 'all';
      if (search) search.value = '';
      limit = PAGE_SIZE;
      apply();
      syncUrl();
    });
    apply();
  }

  // ---------- Code blocks: language label + copy ----------
  document.querySelectorAll('.prose pre').forEach((pre) => {
    let frame = pre.closest('.highlighter-rouge');
    if (!frame) {
      frame = el('div', 'highlighter-rouge');
      pre.replaceWith(frame);
      frame.append(pre);
    }
    if (frame.querySelector('.code-bar')) return;
    const source = frame.matches('[class*="language-"]') ? frame : pre.querySelector('code[class*="language-"]');
    const match = source ? source.className.match(/language-([\w+#-]+)/) : null;
    const lang = match && match[1] !== 'plaintext' ? match[1] : 'text';
    const bar = el('div', 'code-bar');
    const copy = el('button', 'code-copy', 'Copy');
    copy.type = 'button';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ''));
        copy.textContent = 'Copied';
      } catch {
        copy.textContent = 'Select + copy';
      }
      setTimeout(() => { copy.textContent = 'Copy'; }, 1800);
    });
    bar.append(el('span', null, lang), copy);
    frame.prepend(bar);
  });

  // ---------- Reading progress ----------
  const progress = document.querySelector('[data-progress]');
  const article = document.querySelector('.article');
  if (progress && article) {
    let ticking = false;
    const update = () => {
      const rect = article.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const ratio = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 1;
      progress.style.transform = `scaleX(${ratio})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ---------- Resume print ----------
  document.querySelectorAll('[data-print]').forEach((button) => button.addEventListener('click', () => window.print()));
})();
