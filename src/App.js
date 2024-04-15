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
          connection.on('ReceiveMessage', (user, message) => {
            setMessages(prevMessages => [...prevMessages, { user, message }]);
          });
        })
        .catch(e => console.log('Connection failed: ', e));
    }
  }, [connection]);

  const sendMessage = async () => {
    if (connection) {
      try {
        await connection.send('SendMessage', userInput, messageInput);
        setMessageInput('');
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="userInput">Username:</label>
        <input type="text" id="userInput" value={userInput} onChange={e => setUserInput(e.target.value)} />
      </div>
      <div>
        <label htmlFor="messageInput">Message:</label>
        <input type="text" id="messageInput" value={messageInput} onChange={e => setMessageInput(e.target.value)} />
      </div>
      <button id="sendButton" ref={sendButtonRef} onClick={sendMessage}>Send</button>
      <ul id="messagesList">
        {messages.map((msg, index) => <li key={index}><strong>{msg.user}</strong>: {msg.message}</li>)}
      </ul>
    </div>
  );
};

export default Chat;
