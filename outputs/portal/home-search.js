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

  const input = document.querySelector('#query');
  const form = document.querySelector('#search');
  const list = document.createElement('ul');
  list.id = 'search-suggestions';
  list.className = 'search-suggestions';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', '추천 현장 검색어');
  list.hidden = true;
  input.after(list);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', list.id);
  input.setAttribute('aria-expanded', 'false');
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[\s·/\-_.(),]+/g, '');
  let matches = [], active = -1;
  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }
  function choose(index) {
    const p = matches[index];
    if (!p) return;
    input.value = p.name;
    close();
    form.requestSubmit();
  }
  function highlight() {
    [...list.children].forEach((item, index) => item.setAttribute('aria-selected', String(index === active)));
    if (active >= 0) {
      input.setAttribute('aria-activedescendant', list.children[active].id);
      list.children[active].scrollIntoView({block: 'nearest'});
    } else input.removeAttribute('aria-activedescendant');
  }
  function suggest() {
    const query = normalize(input.value);
    matches = query ? (window.PORTAL_PROPERTIES || []).filter(p => normalize([p.name, p.region, p.area, p.address, p.buildingName].join(' ')).includes(query)).slice(0, 8) : [];
    active = -1;
    list.replaceChildren();
    for (const [index, p] of matches.entries()) {
      const item = document.createElement('li');
      item.id = 'search-option-' + index;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.textContent = p.name;
      const area = document.createElement('small');
      area.textContent = p.area || p.region || '';
      item.append(area);
      item.addEventListener('click', () => choose(index));
      list.append(item);
    }
    list.hidden = matches.length === 0;
    input.setAttribute('aria-expanded', String(!list.hidden));
    input.removeAttribute('aria-activedescendant');
  }
  input.addEventListener('input', e => { if (!e.isComposing) suggest(); });
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
  form.addEventListener('submit', close);
  document.addEventListener('click', e => { if (!form.contains(e.target)) close(); });
})();
