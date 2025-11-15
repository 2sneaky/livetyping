console.log("firebase:", firebase)

const firebaseConfig = {
  apiKey: "AIzaSyBghqjVi0Eci-lLlaVvU6N2EbHGzzpuzzk",
  authDomain: "live-typing1.firebaseapp.com",
  databaseURL: "https://live-typing1-default-rtdb.firebaseio.com",
  projectId: "live-typing1",
  storageBucket: "live-typing1.firebasestorage.app",
  messagingSenderId: "673667397761",
  appId: "1:673667397761:web:39cda5edd647db54eaf580"
}

firebase.initializeApp(firebaseConfig)
const db = firebase.database()

let myId = null
let roomRef = null
let input = null
let streamsDiv = null
let roomNameEl = null
let ownerPwEl = null

window.onload = () => {
  input = document.getElementById("input")
  streamsDiv = document.getElementById("streams")
  roomNameEl = document.getElementById("roomName")
  ownerPwEl = document.getElementById("ownerPw")

  document.getElementById("joinBtn").onclick = joinRoom
  document.getElementById("clearBtn").onclick = () => input.value = ""

  window.addEventListener("beforeunload", leaveRoom)
}

function joinRoom() {
  const customName = document.getElementById("customName").value.trim()
  const room = document.getElementById("room").value.trim().toLowerCase()

  if (!room) return

  myId = crypto.randomUUID()
  roomRef = db.ref("rooms/" + room)
  roomNameEl.textContent = room

  document.getElementById("join").hidden = true
  document.getElementById("app").hidden = false

  const userRef = roomRef.child("users/" + myId)

  userRef.onDisconnect().remove()

  userRef.set({
    name: customName || ("user-" + myId.substring(0, 4)),
    text: ""
  })

  input.addEventListener("input", () => {
    userRef.update({ text: input.value })
  })

  roomRef.child("users").on("value", snap => {
    const users = snap.val() || {}
    updateStreams(users)
  })

  setupOwnerControls(room)
}

function updateStreams(users) {
  streamsDiv.innerHTML = ""

  Object.entries(users).forEach(([id, data]) => {
    if (id === myId) return

    const stream = document.createElement("div")
    stream.className = "stream"

    const title = document.createElement("div")
    title.className = "title"
    title.textContent = data.name

    const content = document.createElement("pre")
    content.className = "content"
    content.textContent = data.text || ""

    stream.appendChild(title)
    stream.appendChild(content)
    streamsDiv.appendChild(stream)
  })
}

function leaveRoom() {
  if (!roomRef || !myId) return
  roomRef.child("users/" + myId).remove()
}

function setupOwnerControls(room) {
  ownerPwEl.oninput = () => {
    const pw = ownerPwEl.value.trim()
    if (pw === "owner123") {
      addOwnerClearButton(room)
    }
  }
}

function addOwnerClearButton(room) {
  if (document.getElementById("ownerClear")) return

  const btn = document.createElement("button")
  btn.id = "ownerClear"
  btn.textContent = "clear room"

  btn.onclick = () => {
    db.ref("rooms/" + room + "/users").set({})
    input.value = ""
  }

  document.body.appendChild(btn)
}
