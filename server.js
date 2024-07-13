// server.js
const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

app.use(express.static('public'));

wss.on('connection', (ws) => {
  let room = null;
  let nickname = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      room = data.room;
      nickname = data.nickname;
      if (!rooms.has(room)) {
        rooms.set(room, new Set());
      }
      rooms.get(room).add(ws);
    } else if (data.type === 'message') {
      if (room && rooms.has(room)) {
        rooms.get(room).forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ 
              type: 'message', 
              content: data.content, 
              nickname: data.nickname 
            }));
          }
        });
      }
    }
  });

  ws.on('close', () => {
    if (room && rooms.has(room)) {
      rooms.get(room).delete(ws);
      if (rooms.get(room).size === 0) {
        rooms.delete(room);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});