// firestore-crud.js — Firestore REST API (no Firebase SDK, no WebChannel)
const _FS_BASE = 'https://firestore.googleapis.com/v1/projects/strandprous/databases/(default)/documents';
const _FS_KEY  = 'AIzaSyBaXFVBZym6iaxz8NZ42PMSxHrROBSFWEg';

// ── Serialization ──────────────────────────────────────────────────────────

function _toVal(v) {
  if (v === null || v === undefined)           return { nullValue: null };
  if (typeof v === 'boolean')                  return { booleanValue: v };
  if (v instanceof Date)                       return { timestampValue: v.toISOString() };
  if (typeof v === 'number')
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string')                   return { stringValue: v };
  if (typeof v === 'function')                 return { nullValue: null };
  if (Array.isArray(v))                        return { arrayValue: { values: v.map(_toVal) } };
  // Compat timestamp { seconds, toDate } ou Firebase SDK Timestamp → re-sérialiser comme timestamp
  if (typeof v === 'object' && typeof v.toDate === 'function')
    return { timestampValue: v.toDate().toISOString() };
  if (typeof v === 'object')                   return { mapValue: { fields: _toFields(v) } };
  return { stringValue: String(v) };
}

function _toFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'id') continue;
    if (typeof v === 'function') continue; // ne jamais sérialiser les méthodes
    fields[k] = _toVal(v);
  }
  return fields;
}

function _fromVal(v) {
  if (!v) return null;
  if ('nullValue'      in v) return null;
  if ('booleanValue'   in v) return v.booleanValue;
  if ('integerValue'   in v) return Number(v.integerValue);
  if ('doubleValue'    in v) return v.doubleValue;
  if ('stringValue'    in v) return v.stringValue;
  if ('timestampValue' in v) {
    const d = new Date(v.timestampValue);
    // Return compat object matching Firestore SDK shape { seconds, toDate() }
    return { seconds: Math.floor(d.getTime() / 1000), toDate: () => d };
  }
  if ('arrayValue'     in v) return (v.arrayValue.values || []).map(_fromVal);
  if ('mapValue'       in v) return _fromFields(v.mapValue.fields || {});
  return null;
}

function _fromFields(fields) {
  const obj = {};
  for (const [k, v] of Object.entries(fields)) obj[k] = _fromVal(v);
  return obj;
}

function _fromDoc(raw) {
  if (!raw?.name) return null;
  const id = raw.name.split('/').pop();
  return { id, ..._fromFields(raw.fields || {}) };
}

// ── HTTP layer ─────────────────────────────────────────────────────────────

async function _req(method, path, body, params = {}, retries = 3) {
  const url = new URL(`${_FS_BASE}/${path}`);
  url.searchParams.set('key', _FS_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach(i => url.searchParams.append(k, i));
    else url.searchParams.set(k, v);
  }
  for (let attempt = 0; attempt < retries; attempt++) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    const opts  = { method, headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal };
    if (body) opts.body = JSON.stringify(body);
    let res;
    try { res = await fetch(url.toString(), opts); }
    finally { clearTimeout(timer); }
    if (res.status === 429 && attempt < retries - 1) {
      await new Promise(r => setTimeout(r, 600 * Math.pow(2, attempt)));
      continue;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(
        new Error(`Firestore REST ${method} ${path} → ${res.status}`),
        { fsError: err }
      );
    }
    return res.status === 204 ? null : res.json();
  }
}

// ── Collection read cache (TTL 60s) ────────────────────────────────────────
const _collCache = new Map(); // path → { data, ts }
const _CACHE_TTL = 60_000;

function _cacheGet(path) {
  const entry = _collCache.get(path);
  if (entry && Date.now() - entry.ts < _CACHE_TTL) return entry.data;
  return null;
}
function _cacheSet(path, data) { _collCache.set(path, { data, ts: Date.now() }); }
export function clearFsCache(path) {
  if (path) _collCache.delete(path);
  else _collCache.clear();
}
window.clearFsCache = clearFsCache;

// Paginated collection read — with in-memory cache
async function _getCollection(collPath) {
  const cached = _cacheGet(collPath);
  if (cached) return cached;
  const docs = [];
  let pageToken;
  do {
    const params = { pageSize: '300' };
    if (pageToken) params.pageToken = pageToken;
    const res = await _req('GET', collPath, null, params);
    (res?.documents || []).forEach(d => { const doc = _fromDoc(d); if (doc) docs.push(doc); });
    pageToken = res?.nextPageToken;
  } while (pageToken);
  _cacheSet(collPath, docs);
  return docs;
}

async function _getDoc(path) {
  return _fromDoc(await _req('GET', path));
}

// Full document replace (no updateMask)
async function _setDoc(path, data) {
  return _fromDoc(await _req('PATCH', path, { fields: _toFields(data) }));
}

// Partial update — only writes listed top-level fields (merge semantics)
async function _patchDoc(path, data) {
  const fields = _toFields(data);
  return _fromDoc(await _req('PATCH', path, { fields }, {
    'updateMask.fieldPaths': Object.keys(fields)
  }));
}

// Auto-ID insert
async function _addDoc(collPath, data) {
  return _fromDoc(await _req('POST', collPath, { fields: _toFields(data) }));
}

async function _deleteDoc(path) {
  await _req('DELETE', path);
}

// Ordered query via runQuery
async function _query(collPath, orderByField, direction = 'DESCENDING') {
  const parts  = collPath.split('/');
  const collId = parts.pop();
  const parent = parts.length ? `${_FS_BASE}/${parts.join('/')}:runQuery` : `${_FS_BASE}:runQuery`;

  const body = {
    structuredQuery: {
      from:    [{ collectionId: collId }],
      orderBy: [{ field: { fieldPath: orderByField }, direction }]
    }
  };
  const res = await fetch(`${parent}?key=${_FS_KEY}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`runQuery ${collPath} → ${res.status}`);
  const rows = await res.json();
  return (rows || []).filter(r => r.document).map(r => _fromDoc(r.document));
}

// ── Helpers ────────────────────────────────────────────────────────────────

const _currentUser = () => {
  try { return JSON.parse(localStorage.getItem('sp_session')); } catch { return null; }
};

function _getSalonPath(collName) {
  const u = _currentUser();
  const salonId = u?.salonId || u?.username || u?.uid || 'demo';
  return `salons/${salonId}/${collName}`;
}

const _now = () => new Date();

// ── CRUD factory ───────────────────────────────────────────────────────────

function _makeCRUD(collName) {
  return {
    async getAll() {
      return _getCollection(_getSalonPath(collName));
    },

    async save(item) {
      const path    = _getSalonPath(collName);
      const payload = { ...item, updatedAt: _now() };
      if (item.id) {
        await _setDoc(`${path}/${item.id}`, payload);
        _collCache.delete(path);
        return item.id;
      }
      const created = await _addDoc(path, { ...payload, createdAt: _now() });
      _collCache.delete(path);
      return created.id;
    },

    async delete(id) {
      const path = _getSalonPath(collName);
      await _deleteDoc(`${path}/${id}`);
      _collCache.delete(path);
    }
  };
}

// ── Public APIs ────────────────────────────────────────────────────────────

export const InvAPI   = _makeCRUD('inventory');
export const StaffAPI = _makeCRUD('staff');
export const ApptAPI  = _makeCRUD('appointments');
export const ExpAPI   = _makeCRUD('expenses');
export const TaskAPI  = _makeCRUD('tasks');
export const AttAPI   = _makeCRUD('attendance');

export const UserAPI = {
  async getAllUsers() {
    const docs = await _getCollection('users');
    return docs.map(({ id, ...rest }) => ({ uid: id, ...rest }));
  }
};

export const SalonRegistryAPI = {

  async syncSalon(data) {
    if (!data?.username) return;

    let existing = null;
    try { existing = await _getDoc(`salons/${data.username}`); } catch {}

    const defaultFlags = {
      inventory: true, staff: true, appointments: true,
      revenue: true, expenses: true, googleForm: true, permissions: true
    };

    const base = {
      createdAt:    existing?.createdAt    || _now(),
      featureFlags: existing?.featureFlags || defaultFlags,
      suspended:    existing?.suspended    ?? false
    };

    await _setDoc(`salons/${data.username}`, {
      ...base,
      username:     data.username,
      businessName: data.businessName || '',
      city:         data.city         || '',
      email:        data.email        || '',
      pw:           data.pw           || existing?.pw           || '',
      bookingSlug:  data.bookingSlug  || existing?.bookingSlug || data.username,
      plan:         data.plan         || null,
      status:       data.status       || 'trial',
      trialStart:   data.trialStart   || existing?.trialStart  || null,
      expiry:       data.expiry       || existing?.expiry      || null,
      featureFlags: base.featureFlags,
      lastSeen:     _now()
    });
  },

  async getSalon(username) {
    if (!username) return null;
    try { return await _getDoc(`salons/${username}`); }
    catch { return null; }
  },

  async getAllSalons() {
    return _getCollection('salons');
  },

  async updateSalon(username, data) {
    if (!username) return;
    await _patchDoc(`salons/${username}`, data);
  },

  async deleteSalon(username) {
    if (!username) return;
    await _deleteDoc(`salons/${username}`);
  }
};

export const ContactAPI = {
  async getAll() {
    try {
      return await _query('contacts', 'createdAt', 'DESCENDING');
    } catch {
      const docs = await _getCollection('contacts');
      return docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }
  },

  async markRead(id) {
    await _patchDoc(`contacts/${id}`, { status: 'read' });
  },

  async markReplied(id) {
    await _patchDoc(`contacts/${id}`, { status: 'replied', repliedAt: _now() });
  },

  async delete(id) {
    await _deleteDoc(`contacts/${id}`);
  }
};

// ── Window exports (backward compat) ──────────────────────────────────────
window.FSInvAPI          = InvAPI;
window.FSStaffAPI        = StaffAPI;
window.FSApptAPI         = ApptAPI;
window.FSExpAPI          = ExpAPI;
window.FSTaskAPI         = TaskAPI;
window.FSAttAPI          = AttAPI;
window.UserAPI           = UserAPI;
window.SalonRegistryAPI  = SalonRegistryAPI;
window.ContactAPI        = ContactAPI;
