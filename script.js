let room = '';
let username = '';
let owner = false;

// safely escaped owner password
const ownerPwVal = "tuffyisnotwuffy67little67massiveignorancehumansarenotkillingalienasquannguyenvan9157&&&$!@####)))()|||}{\"\"\":>...........";

const joinBtn = document.getElementById('joinBtn');
const roomInput = document.getElementById('room');
const customName = document.getElementById('customName');
const app = document.getElementById('app');
const join = document.getElementById('join');
const input = document.getElementById('input');
const streams = document.getElementById('streams');
const clearBtn = document.getElementById('clearBtn');
const roomName = document.getElementById('roomName');
const ownerPw = document.getElementById('ownerPw');
const gSignInBtn = document.getElementById('gSignInBtn');
const statusBox = document.getElementById('status');

let userId = Math.random().toString(36).substr(2, 8);
let hasJoined = false;

// -------- Firebase config + loader --------
const firebaseConfig = {
  apiKey: "AIzaSyBghqjVi0Eci-lLlaVvU6N2EbHGzzpuzzk",
  authDomain: "live-typing1.firebaseapp.com",
  databaseURL: "https://live-typing1-default-rtdb.firebaseio.com",
  projectId: "live-typing1",
};

let db = null;
let firebaseReady;

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.color = isError ? '#ff9494' : '#f1b34d';
}

// -------- Local fallback (when Firebase is blocked) --------
function createLocalDb() {
  console.warn('Firebase has not loaded; using local fallback.');
  const storeKey = 'ltRooms';
  const listeners = {};

  function normalize(path) {
    return path.replace(/^\/+|\/+$/g, '');
  }

  function snapshotFor(value) {
    return { val: () => value };
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(storeKey) || '{}');
    } catch (e) {
      console.warn('Resetting local cache after parse error', e);
      return {};
    }
  }

  let state = readState();

  function persist() {
    localStorage.setItem(storeKey, JSON.stringify(state));
    notify();
  }

  function notify() {
    Object.entries(listeners).forEach(([path, cbs]) => {
      const value = getAtPath(path);
      const snap = snapshotFor(value);
      cbs.forEach((cb) => cb(snap));
    });
  }

  function getAtPath(path) {
    if (!path) return state;
    return normalize(path)
      .split('/')
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), state);
  }

  function setAtPath(path, value) {
    const keys = normalize(path).split('/');
    let cursor = state;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      cursor[key] = cursor[key] || {};
      cursor = cursor[key];
    }
    cursor[keys[keys.length - 1]] = value;
  }

  function removeAtPath(path) {
    const keys = normalize(path).split('/');
    let cursor = state;
    for (let i = 0; i < keys.length - 1; i++) {
      cursor = cursor[keys[i]];
      if (!cursor) return;
    }
    if (cursor) delete cursor[keys[keys.length - 1]];
  }

  function ref(path) {
    const normalized = normalize(path);
    return {
      set(value) {
        setAtPath(normalized, value);
        persist();
      },
      update(value) {
        const current = getAtPath(normalized);
        const base = typeof current === 'object' && current !== null ? current : {};
        setAtPath(normalized, { ...base, ...value });
        persist();
      },
      remove() {
        removeAtPath(normalized);
        persist();
      },
      on(event, cb) {
        if (event !== 'value') return;
        listeners[normalized] = listeners[normalized] || [];
        listeners[normalized].push(cb);
        cb(snapshotFor(getAtPath(normalized)));
        return () => {
          listeners[normalized] = (listeners[normalized] || []).filter((fn) => fn !== cb);
        };
      },
      onDisconnect() {
        return {
          remove() {
            window.addEventListener(
              'beforeunload',
              () => {
                removeAtPath(normalized);
                persist();
              },
              { once: true }
            );
          }
        };
      }
    };
  }

  return { ref };
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && existing.dataset.loaded === '1') {
      resolve();
      return;
    }

    const el = existing || document.createElement('script');
    el.src = src;
    el.async = true;
    el.dataset.loaded = '0';
    el.onload = () => {
      el.dataset.loaded = '1';
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    if (!existing) document.head.appendChild(el);
  });
}

async function initFirebase() {
  if (db) return db;

  if (window.firebase) {
    window.firebase.initializeApp(firebaseConfig);
    db = window.firebase.database();
    setStatus('');
    return db;
  }

  try {
    setStatus('Loading Firebase...');
    const sources = [
      'https://www.gstatic.com/firebasejs/10.6.1/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.6.1/firebase-database-compat.js',
      'https://www.gstatic.com/firebasejs/10.6.1/firebase-auth-compat.js'
    ];
    for (const src of sources) {
      await loadScript(src);
    }
    if (!window.firebase) throw new Error('Firebase SDK unavailable');
    window.firebase.initializeApp(firebaseConfig);
    db = window.firebase.database();
    setStatus('');
    return db;
  } catch (err) {
    console.warn('Firebase has not loaded; switching to local mode.', err);
    db = createLocalDb();
    setStatus('');
    return db;
  }
}

firebaseReady = initFirebase();

// -------- Google Sign-In --------
window.addEventListener('load', () => {
  const g = window.google;
  if (!g?.accounts?.id) return;
  g.accounts.id.initialize({
    client_id: "988642885375-da5mgubj08fp7113tpi443nvdepobkvb.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });
  g.accounts.id.renderButton(
    gSignInBtn,
    { theme: 'outline', size: 'large', text: 'signin_with' }
  );
});

function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);
  username = payload.given_name || payload.name || 'Guest';
  joinRoom();
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

// -------- Join Room --------
async function joinRoom() {
  if (hasJoined) return;
  if (!db) await firebaseReady;
  room = roomInput.value.trim();
  if (!room) return;
  if (!username) username = customName.value.trim() || 'Guest';
  hasJoined = true;
  join.hidden = true;
  app.hidden = false;
  roomName.textContent = room;

  const roomRef = db.ref('rooms/' + room + '/users/' + userId);
  roomRef.set({ username, text: '' });
  roomRef.onDisconnect().remove();

  listenRoom();
}

// -------- Listen Room --------
function listenRoom() {
  const usersRef = db.ref('rooms/' + room + '/users');
  usersRef.on('value', snapshot => {
    streams.innerHTML = '';
    const users = snapshot.val() || {};
    for (const uid in users) {
      const u = users[uid];
      const el = document.createElement('div');
      el.className = 'stream';
      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = uid === userId ? 'you' : u.username;
      const content = document.createElement('pre');
      content.className = 'content';
      content.textContent = u.text || '';
      el.appendChild(title);
      el.appendChild(content);
      streams.appendChild(el);
    }
  });
}

// -------- Typing --------
input.addEventListener('input', () => {
  const txt = input.value;
  db.ref('rooms/' + room + '/users/' + userId).update({ text: txt });
});

// -------- Clear --------
clearBtn.addEventListener('click', () => {
  input.value = '';
  db.ref('rooms/' + room + '/users/' + userId).update({ text: '' });
});

// -------- Join button + keyboard --------
joinBtn.addEventListener('click', joinRoom);
[roomInput, customName].forEach((el) =>
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinRoom();
  })
);

// -------- Owner password --------
ownerPw.addEventListener('change', () => {
  if (ownerPw.value === ownerPwVal) {
    owner = true;
    const btn = document.createElement('button');
    btn.textContent = 'clear all';
    btn.id = 'ownerClear';
    btn.onclick = () => db.ref('rooms/' + room + '/users').remove();
    document.getElementById('container').appendChild(btn);
  } else {
    ownerPw.value = '';
  }
});
