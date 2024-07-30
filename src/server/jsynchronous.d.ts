declare module 'jsynchronous' {
  import { Socket } from "socket.io";

  type SyncedVariableInfo = {
    client_history: boolean;
    counter: number;
    handshake: boolean;
    history_length: number;
    name: string;
    one_way: boolean;
    resyncs: number;
    rewind: boolean;
    rewound: boolean;
    snapshots: string[];
    standIn: boolean;
  }

  type SyncedVariable<T> = T & {
    $info: () => SyncedVariableInfo;
    $ync: (socket: Socket) => void;
    $unsync: (socket: Socket) => void;
    $napshot: (name: string) => void;
    $copy: () => T;
    $rewind: (snapshot: string, counter: number) => void; // Client only
    $on: (event: string, callback: () => void) => void; // Client only
    $tart: () => void; // Client only
    $listeners: () => Socket[]; // Server only
  }

  function Jsynchronous<T>(initialData: T, name: string): SyncedVariable<T>;
  namespace Jsynchronous {
    function send(socket: Socket, data: string): void;
    function onmessage(socket: Socket, data: string): void;
    function list(): string[];
    function variables(): {[key: string]: any[]};
  }
  export default Jsynchronous
  export { SyncedVariable, SyncedVariableInfo }
}