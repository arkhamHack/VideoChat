const express = require("express");
const app = express();
const server = require("http").Server(app);
const { Server } = require("socket.io")
const ExpressPeerServer = require('peer').ExpressPeerServer;
app.use(express.static('public'));
//express.static is used as middleware to serve static assets like css files and javascript files
app.set('view engine', 'ejs');

//uuidv4- version 4 universally unique identifier  
const { v4: uuidv4 } = require("uuid"); //syntax to use uuidv4
const io = new Server(server);
var peerServer = ExpressPeerServer(server, { debug: true });//if there is error debug will show them
app.use("/peer.js", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);//redirecting user to that url
});
app.get("/:room", (req, res) => {
    var rid = req.params.room
    res.render("room.ejs", { roomId: rid });
});
//socket shows incoming socket connection or argument of the connection event
//io is a instance of Sockt.io server using the https server
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {//here join room is the event we are waiting for
        socket.join(roomId);
        socket.to(roomId).broadcast("Connected to user: ", userId);
    });
});
server.listen(4500);

