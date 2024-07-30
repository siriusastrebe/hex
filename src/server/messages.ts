import jsynchronous from 'jsynchronous';

export class Chatroom {
  constructor(id) {
    this.id = id;
    this.counter = 0;
    this.messages = [];
    this.websockets = [];
    this.$chatroom = jsynchronous({messages: []}, `chatroom-${id}`);
  } 
  join(websocket) {
    this.websockets.push(websocket);
    this.$chatroom.$ync(websocket);
  }
  leave(websocket) {
    this.websockets = this.websockets.filter(ws => ws !== websocket);
    this.$chatroom.$unsync(websocket);
  }
  broadcast(websocket, contents) {
    const message = new Message(this.websockets.indexOf(websocket), contents, this)
    this.$chatroom.messages.push(message.serialize());
  }
  newId() {
    return this.counter++;
  }
}

export class Message {
  constructor(author, contents, room) {
    this.id = room.newId();
    this.author = author;
    this.contents = contents;
    this.room = room;
    this.created = new Date().getTime();
  }
  serialize() {
    return {
      id: this.id,
      author: this.author,
      contents: this.contents,
      created: this.created,
      room: this.room.id,
    }
  }
}