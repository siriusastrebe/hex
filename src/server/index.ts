import express from 'express';
import jsynchronous from 'jsynchronous';
import { Server } from 'socket.io';
import compression from 'compression';
import { HexGrid2d } from '../client/geometry.js';
import { Chatroom } from './messages.js';

const LAG = 500;

const app = express();
const port = 9000;
app.use(compression());

// Jsynchronous
jsynchronous.send = (websocket, data) => {
  setTimeout(() => {
    websocket.emit('msg', data);
    console.log(`${(data.length/1000).toFixed(2)} kB`, data);
  }, LAG);
}

let counter = 0;
const initialHexes = new HexGrid2d().hexesInRadius(3).map((hex) => { return { id: counter++, q: hex.q, r: hex.r, z: hex.z, type: 'tile', subtype: Math.random() > 0.5 ? 'water' : 'dirt'} });
const initialCharacters = [];

const $gameboard = jsynchronous({version: 32, pieces: [...initialHexes, ...initialCharacters]}, 'gameboard');
const generalChat = new Chatroom('general');

const $sharedState = jsynchronous({}, 'sharedState');

// Express
const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Socket.io
const io = new Server(server);

io.on('connection', (socket) => {
  socket.on('msg', (data) => { setTimeout(() => { jsynchronous.onmessage(socket, data) }, LAG); });

  $gameboard.$ync(socket);
  $sharedState.$ync(socket);
  generalChat.join(socket);

  socket.on('disconnect', () => $gameboard.$unsync(socket));

  socket.on('draw', (data) => {
    // TODO: Add input validation
    const q = data.q;
    const r = data.r;
    const z = data.z || 0;
    const spin = data.spin || 0;
    const type = data.type;
    const subtype = data.subtype;
    console.log('draw', q, r, z, type, subtype);

    if (type !== 'ornament' && $gameboard.pieces.find((tile) => tile && tile.q === q && tile.r === r && tile.z === z && tile.type === type)) {
      return;
    } else {
      $gameboard.pieces.push({id: counter++, q, r, z, spin, subtype, type});
    }
  });

  socket.on('erase', (data) => {
    const id = data.id;
    const index = $gameboard.pieces.findIndex((piece) => piece && piece.id === id);
    delete $gameboard.pieces[index];
  });

  socket.on('message', (data) => {
    if (data.substring(0, 5) === '/set ') {
      const text = data.substring(5);
      const key = text.substring(0, text.indexOf(' '));
      const value = text.substring(text.indexOf(' ') + 1);
      console.log('b', key, value);
      if (key && value) {
      console.log('c', key, value)
        $sharedState[key] = value;
      }
    }
    generalChat.broadcast(socket, data);
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/index.html');
});

app.get('/assets/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log(filename)
  res.sendFile(process.cwd() + '/dist/assets/' + filename);
});

app.get('/public/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log(filename)
  res.sendFile(process.cwd() + '/public/' + filename);
});

app.get('/jsynchronous-client.js', (req, res) => {
  res.sendFile('/node_modules/jsynchronous/jsynchronous-client.js', {'root': __dirname});
});
