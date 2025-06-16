import React, { useEffect, useState } from 'react';

const API = 'http://localhost:4000';

export default function ChatRoom({ room = 'general', user }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        fetch(`${API}/rooms/${room}/messages`)
            .then(res => res.json())
            .then(setMessages);
        // Optionally, add polling or websockets for real-time updates
    }, [room]);

    const sendMessage = async () => {
        if (!text.trim()) return;
        const res = await fetch(`${API}/rooms/${room}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, text })
        });
        const msg = await res.json();
        setMessages([...messages, msg]);
        setText('');
    };

    const deleteMessage = async (id) => {
        await fetch(`${API}/rooms/${room}/messages/${id}`, { method: 'DELETE' });
        setMessages(messages.filter(m => m.id !== id));
    };

    return (
        <div>
            <h2>Room: {room}</h2>
            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', marginBottom: 10 }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{ margin: 5 }}>
                        <b>{msg.user}:</b> {msg.text}
                        {msg.user === user && (
                            <button onClick={() => deleteMessage(msg.id)} style={{ marginLeft: 10 }}>Delete</button>
                        )}
                    </div>
                ))}
            </div>
            <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}
