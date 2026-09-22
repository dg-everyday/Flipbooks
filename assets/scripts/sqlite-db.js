/**
 * Shared sql.js access for the Daily Grace web components.
 *
 * sql.js itself is loaded by a plain <script> tag on the page. This module only
 * starts it, and prefers the shared starter in assets/scripts/sql_script.js so
 * the wasm runtime is downloaded and instantiated once for every database on
 * the page. When that script is absent — a page that uses a component on its
 * own — it starts sql.js here instead.
 */

const SQL_JS_BASE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/';

export function getSqlJs() {
  if (typeof window.loadSqlJs === 'function') return window.loadSqlJs();
  if (typeof window.initSqlJs !== 'function') {
    return Promise.reject(new Error('sql.js was not loaded. Check the sql-wasm.js script on the page.'));
  }
  return window.initSqlJs({ locateFile: (file) => SQL_JS_BASE_URL + file });
}

/** Fetches a .db file and opens it. The caller closes it when finished. */
export async function openDatabase(url) {
  const [SQL, response] = await Promise.all([
    getSqlJs(),
    fetch(url, { cache: 'force-cache' }),
  ]);
  if (!response.ok) throw new Error(`Unable to load ${url} (${response.status})`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  const header = new TextDecoder().decode(bytes.subarray(0, 15));
  if (!header.startsWith('SQLite format 3')) {
    throw new Error(`${url} is not a valid SQLite database.`);
  }
  return new SQL.Database(bytes);
}

/** Runs a query and returns its rows as plain objects. */
export function query(database, sql, params) {
  const statement = database.prepare(sql);
  try {
    if (params) statement.bind(params);
    const rows = [];
    while (statement.step()) rows.push(statement.getAsObject());
    return rows;
  } finally {
    statement.free();
  }
}
