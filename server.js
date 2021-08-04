const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

//MiddleWares
app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(morgan('dev'));

// Routes
app.use(require('./routes/index'));

// StaticFiles
app.use(express.static('public'));



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
