import logo from './logo.svg';
import './App.css';

import { useEffect, useState } from 'react'

import SocketManager from './SocketManager';

function App() {
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    SocketManager.instance.connectSocket();
    SocketManager.instance.onChannel(room, (e => {
      console.log(e);
    }));
    SocketManager.instance.onChannel('0000', (e => {
      console.log(e)
    }));
  }, []);

  const sendMessage = (message) => {
    fetch('http://localhost:8080/api/message', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idUser: from, roomNumber : room, content : message })
    });
   
  }

  return (
    <div className="App">
      <p>Enter your user:</p>
      <input
        type="text"
        onChange={e => setFrom(e.target.value)}
      />
      <p>Enter your room:</p>
      <input
        type="text"
        onChange={e => setRoom(e.target.value)}
      />
      <p>Enter your message:</p>
      <input
        type="text"
        onChange={e => setMessage(e.target.value)}
      />
      <button onClick={() => sendMessage(message)}>send</button>
    </div>
  );
}

export default App;