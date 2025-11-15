// -------- Firebase config --------
const firebaseConfig = {
  apiKey: "AIzaSyBghqjVi0Eci-lLlaVvU6N2EbHGzzpuzzk",
  authDomain: "live-typing1.firebaseapp.com",
  databaseURL: "https://live-typing1-default-rtdb.firebaseio.com",
  projectId: "live-typing1",
}

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let room = '';
let username = '';
let owner = false;
const ownerPwVal = `tuffyisnotwuffy67little67massiveignorancehumansarenotkillingalienasquannguyenvan9157&&&$!@####)))()|||}{""":>...........`;

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

let userId = Math.random().toString(36).substr(2, 8);

// -------- Google Sign-In --------
window.onload = function() {
  google.accounts.id.initialize({
    client_id: "988642885375-da5mgubj08fp7113tpi443nvdepobkvb.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });
  google.accounts.id.renderButton(
    gSignInBtn,
    { theme: 'outline', size: 'large', text: 'signin_with' }
  );
};

function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);
  username = payload.given_name || payload.name || 'Guest';
  joinRoom();
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g,'+').replace(/_/g,'/');
  return JSON.parse(atob(base64));
}

// -------- Join Room --------
function joinRoom() {
  room = roomInput.value.trim();
  if (!room) return;
  if (!username) username = customName.value.trim() || 'Guest';
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
