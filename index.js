// Express
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv').config();
const socketIO = require('socket.io');

const app = express();
const port = process.env.PORT || 5000;

// Url Endcoded
app.use(express.urlencoded({ extended: true }));
// Body Parser
app.use(bodyParser.json());
// Serve Static File in 'Public' Folder
app.use(express.static('public'));
// Allow Cors
app.use(cors());
// File Upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

// Routes
const threadsRoutes = require('./src/routes/threads');
const usersRoutes = require('./src/routes/user');
const authRoutes = require('./src/routes/auth');
const followersRoutes = require('./src/routes/followers');
const notificationsRoutes = require('./src/routes/notifications');

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(
    Buffer.from('<h1><center>REST API For Threads Clone App</h1></center>')
  );
});

const httpServer = http.createServer(app);

const io = new socketIO.Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Routes List
app.use('/v1', threadsRoutes);
app.use('/v1', usersRoutes);
app.use('/v1', authRoutes);
app.use('/v1', followersRoutes);
app.use('/v1', notificationsRoutes);

let users = [];

const onConnection = (socket) => {
  console.log('User Connected');
  const user = {
    socket: socket,
  };

  socket.on('registerUserToSocket', (id) => {
    user.id = id;
    users.push(user);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
    let index = users.indexOf(user);
    if (index !== -1) users.splice(index, 1);
  });

  app.set('socketio', io);
  app.set('users', users);
};

io.on('connection', onConnection);

httpServer.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
