const BACKEND_SOCKET_URI = 'ws://localhost:8080/ws';

const CLOSED_CONNECTION = -1;
const WAITING_CONNECTION = 0;
const OPEN_CONNECTION = 1;

var Stomp = require('stompjs/lib/stomp.js').Stomp;
const subsribeUrl = BACKEND_SOCKET_URI;

class SocketManager {
  socket = null;
  channel = new Map();
  connectionStatus = CLOSED_CONNECTION;
  userInfo = null;
  messageQueueNeedEmit = [];
  lastPing = null;
  interval = null;

  constructor() {
    if (SocketManager.instance) {
      return SocketManager.instance;
    }
    SocketManager.instance = this;

    return this;
  }

  setChannel(channel) {
    this.channel = channel;
  }

  getChannel() {
    return this.channel;
  }

  setConnectionStatus(status) {
    this.connectionStatus = status;
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  setUserInfo(data) {
    this.userInfo = data;
  }

  getUserInfo() {
    return this.userInfo;
  }

  connectSocket = async () => {
    const socket = new WebSocket(subsribeUrl); //create wrapper
    const client = Stomp.over(socket); //connect using your client
    this.setConnectionStatus(WAITING_CONNECTION);
    
    client.connect(
      {
      },
      () => {
        if (this.getConnectionStatus == OPEN_CONNECTION) {
          client.disconnect();
          return;
        }
        this.stomp = client;
        this.setConnectionStatus(OPEN_CONNECTION);
        this.channel.forEach((v, k) => {
          this.subscribe(k, v);
        });
      },
      (e) => {
        if (this.connectionStatus == OPEN_CONNECTION) {
          this.setConnectionStatus(CLOSED_CONNECTION);
        }
        setTimeout(() => {
          if (this.connectionStatus == CLOSED_CONNECTION) {
            this.connectSocket();
          }
        }, 3000);
      },
    );
  };

  subscribe(channelName, callback) {
    this.stomp.subscribe('/topic/' + channelName, (data) => {
      const body = JSON.parse(data.body);
      callback(body);
    });
  }

  onChannel(channelName, callback) {
    this.getChannel().set(channelName, callback);
    if (this.connectionStatus == OPEN_CONNECTION)
      this.subscribe(channelName, callback);
  }
}

const instance = new SocketManager();
export default SocketManager;
