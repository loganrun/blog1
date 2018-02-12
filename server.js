const express = require('express');
const morgan = require('morgan');

const app = express();

const blogPostRouter = require('./blogPostRouter');

// log the http layer
app.use(morgan('common'));

app.use(express.static('public'));

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html');
// });

app.use('/blog-posts', blogPostRouter);
app.use('/blog-posts/:id', blogPostRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
