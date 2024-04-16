import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const Chat = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const sendButtonRef = React.createRef();

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7202/chat")
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(result => {
          console.log('Connected!');
          sendButtonRef.current.disabled = false;
          connection.on('ReceiveMessage', (user, message, timestamp) => {
            const newMessage = { user, message, timestamp };
            setMessages(prevMessages => [...prevMessages.slice(-9), newMessage]);
          });
        })
        .catch(e => console.log('Connection failed: ', e));
    }
  }, [connection]);

  const sendMessage = async () => {
    if (connection) {
      try {
        const timestamp = new Date().toISOString();
        await connection.send('SendMessage', userInput, messageInput, timestamp);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getMessageColor = (index) => {
    const colors = ['#ff5733', '#33ff57', '#5733ff', '#ff33d1', '#33d1ff', '#d1ff33', '#33ffe4', '#ff33a6', '#33a6ff', '#ff9e33'];
    return colors[index % colors.length];
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="userInput" style={{ marginRight: '10px' }}>Username:</label>
        <input type="text" id="userInput" value={userInput} onChange={e => setUserInput(e.target.value)} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="messageInput" style={{ marginRight: '10px' }}>Message:</label>
        <input type="text" id="messageInput" value={messageInput} onChange={e => setMessageInput(e.target.value)} />
      </div>
      <button id="sendButton" ref={sendButtonRef} onClick={sendMessage} style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Send</button>
      <ul id="messagesList" style={{ listStyleType: 'none', padding: '0' }}>
        {messages.map((msg, index) => (
          <li key={index} style={{ backgroundColor: getMessageColor(index), padding: '10px', marginBottom: '5px', borderRadius: '5px' }}>
            <strong>{msg.user}</strong>: {msg.message} - {msg.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chat;
