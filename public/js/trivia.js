const socket = io();

const urlSearchParams = new URLSearchParams(window.location.search);
const playerName = urlSearchParams.get("playerName");
const room = urlSearchParams.get("room");

const mainHeadingTemplate = document.querySelector(
  "#main-heading-template"
).innerHTML;

const welcomeHeadingHTML = Handlebars.compile(mainHeadingTemplate);

document.querySelector("main").insertAdjacentHTML(
  "afterBegin",
  welcomeHeadingHTML({
    playerName,
  })
);

socket.on('connect', () => {
    console.log(socket.connected);
})


socket.emit('join', { playerName, room }, (err) => {
    console.log("emitting");
    if (err) {
        alert(err);
        location.href = '/'
    }
});

socket.on("message", ({ playerName, text, createdAt }) => {
  
  const chatMessages = document.querySelector(".chat__messages");

  const messageTemplate = document.querySelector("#message-template").innerHTML;

  const template = Handlebars.compile(messageTemplate);

  const html = template({
    playerName,
    text,
    createdAt: moment(createdAt).format("h:mm a"),
  });

  chatMessages.insertAdjacentHTML("afterBegin", html);
});

socket.on("room", ({ room, players }) => {
  // target the container where we'll attach the info to
  const gameInfo = document.querySelector(".game-info");

  // target the Handlebars template we'll use to format the game info
  const sidebarTemplate = document.querySelector(
    "#game-info-template"
  ).innerHTML;

  // Compile the template into HTML by calling Handlebars.compile(), which returns a function
  const template = Handlebars.compile(sidebarTemplate);

  const html = template({
    room,
    players,
  });

  // set gameInfo container's html content to the new html
  gameInfo.innerHTML = html;
});

const chatForm = document.querySelector(".chat__form");

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const chatFormInput = chatForm.querySelector(".chat__message");
  const chatFormButton = chatForm.querySelector(".chat__submit-btn");

  chatFormButton.setAttribute("disabled", "disabled");

  const message = event.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    chatFormButton.removeAttribute("disabled");
    chatFormInput.value = "";
    chatFormInput.focus();

    if (error) return alert(error);
  });
});


const triviaQuestionButton = document.querySelector(".trivia__question-btn");
triviaQuestionButton.addEventListener("click", () => {
  // pass null as the second argument because we're not sending any data to the server
  // alert the error if the server sends back an error
  socket.emit("getQuestion", null, (error) => {
    if (error) return alert(error);
  });
});