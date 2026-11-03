(() => {
  const panel = document.querySelector('.search-panel');
  const oldSection = document.querySelector('.search-section');
  document.querySelector('.portal-hero').append(panel);
  oldSection.remove();

  const cards = document.querySelector('#featured-cards');
  const oldLink = document.querySelector('#featured .all-sites');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = oldLink.className;
  toggle.textContent = '전체보기';
  toggle.setAttribute('aria-controls', cards.id);
  toggle.setAttribute('aria-expanded', 'false');
  oldLink.replaceWith(toggle);
  toggle.addEventListener('click', () => {
    const expanded = cards.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? '접기' : '전체보기';
  });

  const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[\s·/\-_.(),]+/g, '');
  const fullName = p => [p.name, p.buildingLabel].filter(Boolean).join(' ');
  const fields = p => [fullName(p), p.region, p.area, p.type, p.tag, p.address, p.buildingName, p.builder, p.intro, p.location, p.keywords].flat().join(' ');
  function setupSuggest(input, container, listId, onChoose) {
    const list = document.createElement('ul');
    list.id = listId;
    list.className = 'search-suggestions';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', '추천 현장 검색어');
    list.hidden = true;
    input.after(list);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('aria-expanded', 'false');
    let matches = [], active = -1, choosing = false;
    function close() {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }
    function choose(index) {
      const p = matches[index];
      if (!p) return;
      choosing = true;
      setTimeout(() => { choosing = false; }, 400);
      input.value = fullName(p);
      close();
      onChoose();
    }
    function highlight() {
      [...list.children].forEach((item, index) => item.setAttribute('aria-selected', String(index === active)));
      if (active >= 0) {
        input.setAttribute('aria-activedescendant', list.children[active].id);
        list.children[active].scrollIntoView({block: 'nearest'});
      } else input.removeAttribute('aria-activedescendant');
    }
    function suggest() {
      if (choosing) return;
      const query = normalize(input.value);
      matches = query ? (window.PORTAL_PROPERTIES || []).filter(p => normalize(fields(p)).includes(query)).slice(0, 8) : [];
      active = -1;
      list.replaceChildren();
      for (const [index, p] of matches.entries()) {
        const item = document.createElement('li');
        item.id = listId + '-option-' + index;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        item.textContent = fullName(p);
        const area = document.createElement('small');
        area.textContent = p.area || p.region || '';
        item.append(area);
        item.addEventListener('mousedown', e => e.preventDefault());
        item.addEventListener('click', e => { e.preventDefault(); choose(index); });
        list.append(item);
      }
      list.hidden = matches.length === 0;
      input.setAttribute('aria-expanded', String(!list.hidden));
      input.removeAttribute('aria-activedescendant');
    }
    input.addEventListener('input', suggest);
    input.addEventListener('compositionend', suggest);
    input.addEventListener('focus', suggest);
    input.addEventListener('keydown', e => {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Escape') { close(); return; }
      if (list.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
        highlight();
      } else if (e.key === 'Enter' && active >= 0) {
        e.preventDefault();
        choose(active);
      }
    });
    input.addEventListener('blur', () => setTimeout(close, 150));
    document.addEventListener('click', e => { if (!container.contains(e.target)) close(); });
    return close;
  }

  const input = document.querySelector('#query');
  const form = document.querySelector('#search');
  const closeHero = setupSuggest(input, form, 'search-suggestions', () => form.requestSubmit());
  form.addEventListener('submit', closeHero);

  const featured = document.querySelector('#featured-search');
  if (featured) {
    const box = featured.closest('.listing-search') || featured.parentElement;
    setupSuggest(featured, box, 'featured-suggestions', () => {
      featured.dispatchEvent(new Event('input', {bubbles: true}));
      featured.blur();
    });
  }
})();
