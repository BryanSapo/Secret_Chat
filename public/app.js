// public/app.js
let socket;
let nickname;

function joinRoom() {
    const secretCode = document.getElementById('secret-code').value;
    nickname = document.getElementById('nickname').value;
    
    if (!secretCode || !nickname) {
      alert('Please enter both a secret code and a nickname');
      return;
    }
  
    socket = new WebSocket(`ws://${window.location.host}`);
  
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', room: secretCode, nickname: nickname }));
      document.getElementById('join-form').style.display = 'none';
      document.getElementById('chat-container').style.display = 'block';
    };
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        addMessageToChat(data.nickname, data.content);
      }
    };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    if (message) {
      socket.send(JSON.stringify({ type: 'message', content: message, nickname: nickname }));
      addMessageToChat(nickname, message, true);
      messageInput.value = '';
    }
  }
  
  function addMessageToChat(sender, message, isOwnMessage = false) {
    const chat = document.getElementById('chat');
    const messageElement = document.createElement('div');
    messageElement.textContent = isOwnMessage ? `You: ${message}` : `${sender}: ${message}`;
    chat.appendChild(messageElement);
    chat.scrollTop = chat.scrollHeight;
  }

document.getElementById('message').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});