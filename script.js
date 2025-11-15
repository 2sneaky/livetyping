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

const joinBtn = document.getElementById("joinBtn")
const input = document.getElementById("input")
const roomNameDisplay = document.getElementById("roomName")
const streams = document.getElementById("streams")
const app = document.getElementById("app")
const join = document.getElementById("join")
let currentRoom = ""
let currentUser = ""

joinBtn.onclick = () => {
  const username = document.getElementById("customName").value.trim()
  const room = document.getElementById("room").value.trim().toLowerCase()

  if (!room) return

  currentRoom = room
  currentUser = username || "guest" + Math.floor(Math.random() * 9999)

  roomNameDisplay.textContent = room
  join.hidden = true
  app.hidden = false

  db.ref("rooms/" + room + "/" + currentUser).set("")

  db.ref("rooms/" + room).on("value", snap => {
    const data = snap.val() || {}
    streams.innerHTML = ""
    Object.keys(data).forEach(user => {
      const p = document.createElement("p")
      p.textContent = user + ": " + data[user]
      streams.appendChild(p)
    })
  })
}

input.oninput = () => {
  if (!currentRoom || !currentUser) return
  db.ref("rooms/" + currentRoom + "/" + currentUser).set(input.value)
}

document.getElementById("clearBtn").onclick = () => {
  input.value = ""
  if (currentRoom && currentUser) {
    db.ref("rooms/" + currentRoom + "/" + currentUser).set("")
  }
}
