<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>live typing rooms</title>
<link rel="stylesheet" href="style.css" />

<script src="https://www.gstatic.com/firebasejs/10.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.6.1/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.6.1/firebase-auth-compat.js"></script>

<script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>

<div id="container">
    <div id="join">
        <input id="customName" placeholder="username (optional)" autocomplete="off" />
        <input id="room" placeholder="room name" autocomplete="off" />
        <button id="joinBtn">join</button>

        <div id="gSignInBtn">sign in with google</div>
    </div>

    <div id="app" hidden>
        <div id="me">
            <textarea id="input" placeholder="type here..."></textarea>
            <button id="clearBtn">clear</button>
        </div>

        <div id="live">
            <h3>room <span id="roomName"></span></h3>
            <div id="streams"></div>
        </div>
    </div>

    <input type="password" id="ownerPw" placeholder="•••" />
</div>

<script src="script.js"></script>
</body>
</html>
