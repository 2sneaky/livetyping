const firebaseConfig = {
  apiKey: "AIzaSyBghqjVi0Eci-lLlaVvU6N2EbHGzzpuzzk",
  authDomain: "live-typing1.firebaseapp.com",
  databaseURL: "https://live-typing1-default-rtdb.firebaseio.com",
  projectId: "live-typing1",
  storageBucket: "live-typing1.firebasestorage.app",
  messagingSenderId: "673667397761",
  appId: "1:673667397761:web:39cda5edd647db54eaf580"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let uid = null;
let username = null;
let room = null;
let myRef = null;

const joinBtn = document.getElementById("joinBtn");
const customName = document.getElementById("customName");
const roomInput = document.getElementById("room");
const app = document.getElementById("app");
const join = document.getElementById("join");
const input = document.getElementById("input");
const roomName = document.getElementById("roomName");
const streams = document.getElementById("streams");
const ownerPw = document.getElementById("ownerPw");

// google sign-in button
function renderGoogleBtn() {
  google.accounts.id.initialize({
    client_id: "673667397761-96h9gkgp6t0c0c2f69lfpp32jrbtk6q0.apps.googleusercontent.com",
    callback: handleGoogleLogin
  });

  google.accounts.id.renderButton(
    document.getElementById("gSignInBtn"),
    { theme: "filled_blue", size: "medium" }
  );
}

renderGoogleBtn();

// handle google login
function handleGoogleLogin(res) {
  const credential = firebase.auth.GoogleAuthProvider.credential(res.credential);
  auth.signInWithCredential(credential).then(user => {
    uid = user.user.uid;
    username = user.user.displayName;
  });
}

joinBtn.onclick = () => {
  room = roomInput.value.trim();
  if (!room) return;

  if (!uid) {
    uid = Math.random().toString(36).slice(2, 10);
    username = customName.value.trim() || "anon";
  }

  join.hidden = true;
  app.hidden = false;
  roomName.textContent = room;

  myRef = db.ref("rooms/" + room + "/" + uid);
  myRef.set({
    user: username,
    text: ""
  });

  myRef.onDisconnect().remove();

  watchRoom(room);
};

function watchRoom(r) {
  db.ref("rooms/" + r).on("value", snap => {
    streams.innerHTML = "";

    const data = snap.val();
    if (!data) return;

    Object.keys(data).forEach(id => {
      const item = data[id];

      const div = document.createElement("div");
      div.className = "stream";

      const title = document.createElement("div");
      title.className = "title";
      title.textContent = item.user;

      const content = document.createElement("pre");
      content.className = "content";
      content.textContent = item.text || "";

      div.appendChild(title);
      div.appendChild(content);
      streams.appendChild(div);
    });
  });
}

input.addEventListener("input", () => {
  if (myRef) {
    myRef.update({ text: input.value });
  }
});

// clear button
document.getElementById("clearBtn").onclick = () => {
  input.value = "";
  if (myRef) myRef.update({ text: "" });
};

// secret owner clear
ownerPw.addEventListener("input", () => {
  if (ownerPw.value === "clearall") {
    if (room) {
      db.ref("rooms/" + room).remove();
      input.value = "";
      streams.innerHTML = "";
    }
    ownerPw.value = "";
  }
});
