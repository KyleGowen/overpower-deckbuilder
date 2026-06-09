/**
 * Home Component
 * Renders the post-auth home screen: hero, community decks, news, tournament placeholder.
 * Data: community decks from GET /api/v1/decks/community
 * News: static HTML articles (add new ones in the news list below)
 */
(function () {
  'use strict';

  let _rendered = false;

  /* ══════════════════════════════════════════════════════════
     STATIC NEWS ITEMS
     To add a new news item: append an object to this array.
     Fields: { tag, tagClass, title, desc, date, imageUrl }
     tagClass options: 'new-cards' | 'feature' | 'update' | 'tournament'
     ══════════════════════════════════════════════════════════ */
  const NEWS_ITEMS = [
    {
      tag: 'NEW CARDS',
      tagClass: 'new-cards',
      title: 'Beasts of Tarzan Universe Now Available',
      desc: 'New Barsoom universe cards have been added to the database, including missions, events, and characters.',
      date: 'Jun 1, 2026',
      imageUrl: null
    },
    {
      tag: 'FEATURE',
      tagClass: 'feature',
      title: 'V2 Interface — Redesigned from the Ground Up',
      desc: 'The Excelsior interface has been completely rebuilt with a modern design system and improved performance.',
      date: 'Jun 8, 2026',
      imageUrl: null
    },
    {
      tag: 'UPDATE',
      tagClass: 'update',
      title: 'Community Deck Sharing Now Live',
      desc: 'Share your best decks with the community. Featured decks now appear on the home screen.',
      date: 'May 15, 2026',
      imageUrl: null
    }
  ];

  /* ══════════════════════════════════════════════════════════
     TOURNAMENT DECKS
     To add tournament results: populate this array.
     Fields: { rank, name, strategy, characterUrl }
     ══════════════════════════════════════════════════════════ */
  const TOURNAMENT_DECKS = [];

  function getCdnImageUrl(path) {
    if (!path) return null;
    const base = (window.APP_CDN_BASE || '').replace(/\/$/, '');
    if (path.startsWith('http')) return path;
    return base + path;
  }

  function characterThumbUrl(defaultImage) {
    if (!defaultImage) return null;
    let raw = defaultImage;
    if (!raw.startsWith('http') && !raw.startsWith('/')) {
      raw = raw.includes('/')
        ? `/src/resources/cards/images/${raw}`
        : `/src/resources/cards/images/characters/${raw}`;
    }
    if (raw.includes('/thumb/')) return getCdnImageUrl(raw);
    const thumb = raw.replace(
      '/src/resources/cards/images/characters/',
      '/src/resources/cards/images/characters/thumb/'
    );
    return getCdnImageUrl(thumb);
  }

  function getDeckHeroImage(deck) {
    const chars = (deck.cards || []).filter(c => c.type === 'character');
    if (!chars.length) return null;
    return characterThumbUrl(chars[0].defaultImage);
  }

  function getDeckCharacterImages(deck) {
    return (deck.cards || [])
      .filter(c => c.type === 'character')
      .slice(0, 4)
      .map(c => characterThumbUrl(c.defaultImage))
      .filter(Boolean);
  }

  function getLegalityBadge(deck) {
    if (deck.metadata.is_valid === true) return '<span class="badge badge-legal">Legal</span>';
    if (deck.metadata.is_limited) return '<span class="badge badge-limited">Limited</span>';
    return '<span class="badge badge-not-legal">Not Legal</span>';
  }

  function renderDeckCard(deck) {
    const meta = deck.metadata || {};
    const heroImg = getDeckHeroImage(deck);
    const name = meta.name || 'Untitled Deck';
    const threat = meta.threat ?? '—';
    const cardCount = meta.cardCount ?? 0;
    const archetype = meta.archetype || meta.format || '';

    const bgStyle = heroImg
      ? `style="background-image: url('${heroImg}')"`
      : '';

    return `
      <div class="home-deck-card" data-deck-id="${meta.id || ''}" title="${name}">
        <div class="home-deck-card-art" ${bgStyle}>
          ${!heroImg ? `<div class="home-deck-card-no-art"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="13" height="17" rx="2"/></svg></div>` : ''}
          <div class="home-deck-card-gradient"></div>
        </div>
        <div class="home-deck-card-overlay">
          <div class="home-deck-card-name">${name}</div>
          ${archetype ? `<div class="home-deck-card-archetype">${archetype}</div>` : ''}
          <div class="home-deck-card-footer">
            <span class="home-deck-card-count">${cardCount} cards</span>
            <span class="home-deck-card-threat">${threat}</span>
          </div>
        </div>
        <button class="home-deck-card-menu" aria-label="Options" onclick="event.stopPropagation()">⋯</button>
      </div>
    `;
  }

  function renderCommunityDecks(decks) {
    const strip = document.getElementById('home-community-strip');
    if (!strip) return;

    if (!decks.length) {
      strip.innerHTML = `<div class="empty-state" style="min-width:300px">
        <div class="empty-state-title">No community decks yet</div>
        <div class="empty-state-text">Community decks will appear here.</div>
      </div>`;
      return;
    }

    strip.innerHTML = decks.map(renderDeckCard).join('');

    // Bind click events
    strip.querySelectorAll('.home-deck-card[data-deck-id]').forEach(card => {
      card.addEventListener('click', () => {
        // Navigate to deck via app routing — use deck view for now
        window.App?.navigateTo('decks', window.App?.getCurrentUser()
          ? `/users/${window.App.getCurrentUser().id}/decks`
          : '/');
      });
    });

    // Lazy load images
    if (window.ImageLoadQueue) {
      window.ImageLoadQueue.processContainer(strip);
    }
  }

  function renderNewsItems() {
    const list = document.getElementById('home-news-list');
    if (!list) return;

    if (!NEWS_ITEMS.length) {
      list.innerHTML = `<div class="empty-state">
        <div class="empty-state-title">No news yet</div>
      </div>`;
      return;
    }

    list.innerHTML = NEWS_ITEMS.map(item => `
      <div class="home-news-item">
        <div class="home-news-image" style="background: var(--color-bg-elevated); display:flex; align-items:center; justify-content:center; color: var(--color-text-muted)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="3" y1="20" x2="21" y2="20"/><line x1="7" y1="20" x2="7" y2="17"/><line x1="17" y1="20" x2="17" y2="17"/></svg>
        </div>
        <div class="home-news-content">
          <span class="home-news-tag home-news-tag-${item.tagClass}">${item.tag}</span>
          <h3 class="home-news-title">${item.title}</h3>
          <p class="home-news-desc">${item.desc}</p>
          <time class="home-news-date">${item.date}</time>
        </div>
      </div>
    `).join('');
  }

  function renderTournamentSection() {
    const section = document.getElementById('home-tournament-section');
    if (!section) return;

    if (!TOURNAMENT_DECKS.length) {
      section.innerHTML = `
        <div class="home-tournament-empty">
          <div class="home-tournament-empty-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
            Coming Soon
          </div>
          <p>Tournament winning decks will be featured here. Check back after the next community tournament.</p>
        </div>
      `;
    }
  }

  function getHtml() {
    return `
      <!-- Hero Banner -->
      <section class="home-hero" aria-label="Welcome">
        <div class="home-hero-bg" role="presentation" aria-hidden="true"></div>
        <div class="home-hero-gradient" aria-hidden="true"></div>
        <div class="home-hero-content">
          <h1 class="home-hero-title">Welcome to Excelsior</h1>
          <p class="home-hero-subtitle">The ultimate OverPower deckbuilding companion</p>
          <p class="home-hero-desc">Build powerful decks, explore thousands of cards, and connect with a global community of OverPower players.</p>
          <a class="home-hero-cta" href="/data" data-route="database">
            Explore Decks
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="13" height="17" rx="2"/><path d="M7 4V2"/><path d="M11 4V2"/></svg>
          </a>
        </div>
      </section>

      <!-- Section Navigation -->
      <div class="home-section-nav" role="navigation" aria-label="Home sections">
        <a href="#home-community" class="home-section-btn active" data-section="community">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Community Decks
        </a>
        <a href="#home-tournament" class="home-section-btn" data-section="tournament">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
          Tournament Decks
        </a>
        <a href="#home-news" class="home-section-btn" data-section="news">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>
          Recent Updates
        </a>
      </div>

      <!-- Community Decks -->
      <section class="home-section" id="home-community" aria-label="Community Decks">
        <div class="home-section-header">
          <h2 class="home-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Community Decks
          </h2>
          <a class="home-view-all" href="#" id="home-community-view-all" data-route="decks">
            View All
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
        <div class="home-deck-strip" id="home-community-strip">
          <!-- Loading skeletons -->
          <div class="home-deck-skeleton"></div>
          <div class="home-deck-skeleton"></div>
          <div class="home-deck-skeleton"></div>
          <div class="home-deck-skeleton"></div>
          <div class="home-deck-skeleton"></div>
        </div>
      </section>

      <!-- Tournament Decks -->
      <section class="home-section" id="home-tournament" aria-label="Tournament Decks">
        <div class="home-section-header">
          <h2 class="home-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
            Tournament Decks
          </h2>
        </div>
        <div id="home-tournament-section">
          <!-- Rendered by renderTournamentSection() -->
        </div>
      </section>

      <!-- Recent Updates / News -->
      <section class="home-section" id="home-news" aria-label="Recent Updates">
        <div class="home-section-header">
          <h2 class="home-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
            Recent Updates
          </h2>
        </div>
        <div class="home-news-list" id="home-news-list">
          <!-- Rendered by renderNewsItems() -->
        </div>
      </section>
    `;
  }

  async function render() {
    const el = document.getElementById('view-home');
    if (!el) return;

    if (!_rendered) {
      el.innerHTML = getHtml();
      _rendered = true;

      // Bind section nav
      el.querySelectorAll('.home-section-btn[data-section]').forEach(btn => {
        btn.addEventListener('click', e => {
          el.querySelectorAll('.home-section-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      // Bind hero CTA
      const cta = el.querySelector('.home-hero-cta[data-route]');
      if (cta) {
        cta.addEventListener('click', e => {
          e.preventDefault();
          window.App?.navigateTo('database', '/data');
        });
      }

      // Bind view all
      const viewAll = document.getElementById('home-community-view-all');
      if (viewAll) {
        viewAll.addEventListener('click', e => {
          e.preventDefault();
          const user = window.App?.getCurrentUser();
          const href = user ? `/users/${user.id}/decks` : '/';
          window.App?.navigateTo('decks', href);
        });
      }

      // Render static content
      renderNewsItems();
      renderTournamentSection();

      // Load community decks asynchronously
      loadCommunityDecks();
    }
  }

  async function loadCommunityDecks() {
    try {
      const { ok, decks } = await window.Decks.listCommunityDecks();
      renderCommunityDecks(ok ? decks : []);
    } catch {
      renderCommunityDecks([]);
    }
  }

  // Listen for view change events
  document.addEventListener('excelsior:view-change', e => {
    if (e.detail?.view === 'home') {
      render();
    }
  });

  window.Home = { render };
})();
