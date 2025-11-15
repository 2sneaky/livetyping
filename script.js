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
const roomInput = document.getElementById("room")
const customNameInput = document.getElementById("customName")
const app = document.getElementById("app")
const joinScreen = document.getElementById("join")
const roomNameText = document.getElementById("roomName")
const input = document.getElementById("input")
const streams = document.getElementById("streams")
const clearBtn = document.getElementById("clearBtn")

let room = ""
let user = ""

joinBtn.onclick = () => {
    room = roomInput.value.trim()
    if (!room) return
    user = customNameInput.value.trim() || ("user" + Math.floor(Math.random()*9999))
    roomNameText.textContent = room
    joinScreen.hidden = true
    app.hidden = false
    listen()
}

input.oninput = () => {
    if (!room || !user) return
    db.ref("rooms/" + room + "/" + user).set(input.value)
}

clearBtn.onclick = () => {
    input.value = ""
    db.ref("rooms/" + room + "/" + user).set("")
}

function listen() {
    db.ref("rooms/" + room).on("value", snap => {
        const data = snap.val() || {}
        streams.innerHTML = ""
        Object.keys(data).forEach(name => {
            const div = document.createElement("div")
            div.textContent = name + ": " + data[name]
            streams.appendChild(div)
        })
    })
}
