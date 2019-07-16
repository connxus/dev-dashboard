const ZenHub = require('node-zenhub');
const DarkSky = require('dark-sky');

const env = require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const zenHubApi = new ZenHub(process.env.ZENHUB);
const darksky = new DarkSky(process.env.DARKSKY);

const port = process.env.PORT || 8080;

const router = express.Router();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.get('/', function(req, res) {
  res.json({ message: 'API Successful'});
});

router.get('/cxs-app', function(req, res) {
  res.json({
    title: 'Application Repo',
    data: data
  });
});

router.get('/cxs-api', function(req, res) {
  res.json({
    title: 'API Repo',
    data: data
  });
});

router.get('/weather', function(req, res) {
  darksky
    .latitude('39.333199')
    .longitude('-84.314605')
    .language('en')
    .units('us')
    .exclude('minutely,hourly,daily')
    .get()
    .then(function(result) {
      res.json( result );
    })
    .catch(console.log)
});


// Setup socket connection here

app.use('/api', router);

server.listen(port);
console.log('Server running on port ' + port);