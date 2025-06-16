const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

let rooms = {
    'general': []
};

// Get messages for a room
app.get('/rooms/:room/messages', (req, res) => {
    const room = req.params.room;
    res.json(rooms[room] || []);
});

// Post a new message
app.post('/rooms/:room/messages', (req, res) => {
    const room = req.params.room;
    const { user, text } = req.body;
    if (!rooms[room]) rooms[room] = [];
    const message = { id: uuidv4(), user, text, timestamp: Date.now() };
    rooms[room].push(message);
    res.json(message);
});

// Delete a message
app.delete('/rooms/:room/messages/:id', (req, res) => {
    const { room, id } = req.params;
    if (!rooms[room]) return res.status(404).send();
    rooms[room] = rooms[room].filter(msg => msg.id !== id);
    res.sendStatus(204);
});

app.listen(4000, () => console.log('Server running on port 4000'));
