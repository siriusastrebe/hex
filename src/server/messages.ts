import jsynchronous, { SyncedVariable } from 'jsynchronous';
import { ChatMessage } from '../types/schema';
import { Socket } from 'socket.io';

export class Chatroom {
  id: string;
  counter: number;
  messages: Message[];
  websockets: Socket[];
  $chatroom: SyncedVariable<{messages: ChatMessage[]}>;

  constructor(id: string) {
    this.id = id;
    this.counter = 0;
    this.messages = [];
    this.websockets = [];
    this.$chatroom = jsynchronous({messages: []}, `chatroom-${id}`);
  } 
  join(websocket: Socket) {
    this.websockets.push(websocket);
    this.$chatroom.$ync(websocket);
  }
  leave(websocket: Socket) {
    this.websockets = this.websockets.filter(ws => ws !== websocket);
    this.$chatroom.$unsync(websocket);
  }
  broadcast(websocket: Socket, contents: string) {
    const message = new Message(this.websockets.indexOf(websocket), contents, this)
    this.$chatroom.messages.push(message.serialize());
  }
  newId() {
    return this.counter++;
  }
}

export class Message {
  id: number;
  author: number;
  contents: string;
  created: number;
  room: Chatroom;

  constructor(author: number, contents: string, room: Chatroom) {
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