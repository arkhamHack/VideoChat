var myVidStream;
const socket = io("/");
const vidGrid = document.getElementById("video-grid");
const myvideo = document.createElement("video");
const chat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myvideo.muted = true;

const username = prompt("Enter your name : ");



const peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",//shows relative hostname
    port: "443"
});
//getusermedia-generates media stream using which we perform the functions
navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
    //here stream is local audio and video stream
    myVidStream = stream;
    addVidStream(myvideo, stream)
    //Emitted when a connection to the PeerServer is established. You may use the peer before this is emitted,
    // but messages to the server will be queued. id is the brokering ID of the peer
    peer.on("call", (call) => {
        call.answer(stream);//.answer is a function of MediaConnection class. The callback of this call event gives us a 
        //MediaConnection objecct that is the stream(audio video) of the other peer
        const another_video = document.createElement("video");
        call.on("stream", function (userStream) {
            addVidStream(another_video, userStream)
        });
    });
    socket.on("user-connected", (userId) => {
        Newuser(userId, stream);
    });
});
const Newuser = (userId, stream) => {
    //starting the call
    const call = peer.call(userId, stream);
    const vid = document.createElement("video");
    call.on("stream", (userVidStream) => {
        addVidStream(vid, userVidStream);
    });
};
//receiving connection or setting up lis
peer.on("open", (id) => {
    socket.emit("join-room", roomID, id);
});

const addVidStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        vidGrid.append(video);
    });
};
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
text.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && text.value.length !== 0) {
        socket.emit('message', text.value);
        text.value = "";
    }
});
send.addEventListener("click", (e) => {
    if (text.value.length !== 0) {
        socket.emit("message", text.value)
        text.value = ""
    }
});
let inviteBtn = document.getElementById("inviteButton");
let muteBtn = document.querySelector("#muteButton");
let stopVideo = document.querySelector("#stopVideo");
muteBtn.addEventListener("click", () => {
    let state = myVidStream.getAudioTracks()[0].enabled;
    if (state) {
        myVidStream.getAudioTracks()[0].enabled = false;
        muteBtn.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
        muteBtn.classList.toggle("background__red");
    } else {
        myVidStream.getAudioTracks()[0].enabled = true;
        /*If the element has a class, the classList.toggle method behaves
         like classList.remove and the class is removed from the element.
          And if the element does not have the specified class, then classList.
          toggle, just like classList.add, adds this class to the element. */
        muteBtn.classList.toggle("background__red");
        muteBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
    }
});
stopVideo.addEventListener("click", () => {
    let state = myVidStream.getVideoTracks()[0].enabled;
    if (state) {
        myVidStream.getVideoTracks()[0].enabled = false;
        stopVideo.innerHTML = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle("background__red");
    } else {
        myVidStream.getVideoTracks()[0].enabled = true;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = `<i class="fas fa-video"></i>`;
    }
});
inviteButton.addEventListener("click", () => {
    prompt("Copy link and join chat: ", window.location.href);
});
let messages = document.querySelector(".messages");
socket.on("createMessage", (message, user) => {
    messages.innerHTML = messages.innerHTML +
        `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${user === username ? "me" : user
        }</span> </b>
        <span>${message}</span>
    </div>`;
});