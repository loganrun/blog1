'use strict';
const express = require('express');
const mongoose = require('mongoose');
const morgan= require('morgan');
const bodyParser = require('body-parser');
mongoose.Promise = global.Promise;
const {PORT,IP, DATABASE_URL} = require('./config.js');
const app = express();
app.use(bodyParser.json());
app.use(morgan('common'));
const {BlogPosts} = require('./models.js');

// const blogPostRouter = require('./blogPostRouter');

// log the http layer
// app.use(morgan('common'));

// app.use(express.static('public'));

app.get('/posts', (req, res) => {
  // res.sendFile(__dirname + '/views/index.html');
  console.log("get request");
  BlogPosts
  .find()
  .limit(10)
  .then(posts => {
    res.json({
      posts: posts.map(
        (post) => post.serialize())
    });
  })
  .catch(error => {
    console.error(err);
    res.status(500).json({error:  'item not found'});
    
  });
});

app.get('/posts/:id', (req, res) => {
  BlogPosts
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.post('/posts', (req, res) => {

  const requiredFields = ['title', 'author', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPosts
    .create({
      title: req.body.title,
      author: req.body.author,
      content: req.body.content,
    })
    .then(post => res.status(201).json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.put('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {};
  const updateableFields = ['title', 'author', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPosts
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(posts => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/posts/:id', (req, res) => {
  BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(posts => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(databaseUrl, port = PORT) {
console.log("server call", databaseUrl);
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port,IP, () => {
        console.log(`Your app is listening ${port} ${IP}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
 }

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};

// app.listen(process.env.PORT || process.env.IP, () => {
//   console.log(`Your app is listening on port ${process.env.PORT || process.env.IP}`);
// });
