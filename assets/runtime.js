/* Minimal data runtime for the Young Knights dashboard.
   Loads the CSVs in /data, runs the page's calculations, and redraws on data, filter or width changes. */
window.dash = (() => {
  const sources = { game_log: 'data/game_log.csv', games: 'data/games.csv' };
  const store = {};
  const calcs = [];
  const subs = [];
  let params = { game: null, player: null };
  const colors = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];

  const data = (id) => store[id] || { status: 'loading', data: [] };
  const emit = () => subs.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });

  function runCalcs() {
    for (const c of calcs) {
      if (!c.inputs.every((i) => store[i] && store[i].status === 'ok')) continue;
      try { store[c.id] = { status: 'ok', data: c.fn(...c.inputs.map((i) => store[i].data)) }; }
      catch (e) { store[c.id] = { status: 'error', data: [], message: String(e) }; console.error(e); }
    }
  }

  async function load() {
    await Promise.all(Object.entries(sources).map(async ([id, url]) => {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
        const rows = d3.csvParse(await res.text());
        store[id] = { status: 'ok', data: rows, columns: rows.columns };
      } catch (e) {
        store[id] = { status: 'error', data: [], message: String(e) };
      }
    }));
    runCalcs();
    document.querySelectorAll('.dash-skeleton').forEach((el) => el.classList.remove('dash-skeleton'));
    emit();
  }

  let lastW = 0;
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { const w = document.documentElement.clientWidth; if (w !== lastW) { lastW = w; emit(); } }, 150);
  });
  document.addEventListener('DOMContentLoaded', () => { lastW = document.documentElement.clientWidth; load(); });

  return {
    data,
    colors,
    calc: (id, { inputs, fn }) => calcs.push({ id, inputs, fn }),
    loader: () => {},
    onData: (fn) => { subs.push(fn); fn(); },
    params: () => ({ ...params }),
    setParams: (p) => { params = { ...params, ...p }; emit(); },
    resetParams: () => { params = { game: null, player: null }; emit(); },
    setLink: (name) => { try { history.replaceState(null, '', '#' + name); } catch (e) { /* ignore */ } },
    refresh: () => load(),
  };
})();
