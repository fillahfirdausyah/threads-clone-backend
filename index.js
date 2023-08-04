// Express
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv').config();

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

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(
    Buffer.from('<h1><center>REST API For Threads Clone App</h1></center>')
  );
});

// Routes List
app.use('/v1', threadsRoutes);
app.use('/v1', usersRoutes);
app.use('/v1', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
