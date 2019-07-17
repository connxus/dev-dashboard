const ZenHub = require('zenhub-api');
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

const zenhubApiRepoId = 26181661;
const zenhubAppRepoId = 26181696;

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.get('/', function(req, res) {
  res.json({ message: 'API Successful'});
});

router.get('/chart', function(req, res) {
  var callback = function (error, data) {
    console.log('error:', error);
    console.log('data:', data);
    res.json({
      title: 'Chart',
      data: data ? data : error
    });
  }

  zenHubApi.boards.getBoard(26181696 ,callback)
});

router.get('/cxs-app', function(req, res) {
  zenHubApi.getBoard({repo_id: 26181696}).then((data)=>{
    res.json({
      title: 'APP Repo',
      data: data
    });
  });
});

router.get('/cxs-api', function(req, res) {
  zenHubApi.getBoard({repo_id: 26181661}).then((data)=>{
    res.json({
      title: 'API Repo',
      data: data
    });
  });
});

router.get('/releases', async function(req, res) {
  zenHubApi.getReleaseReportsForRepo({repo_id: 26181661}).then((data)=>{
    let filteredReleases = data.filter((release) => {
      if (release.state === 'open') {
        return release;
      }
    });

    let settingUp = new Promise((resolve, reject) => {
      filteredReleases.map((release, index, array) => {
        let todaysDate = new Date();
        let desiredEndDate = new Date(release.desired_end_date);

        release.appIssueCount = 0;
        release.apiIssueCount = 0;
        release.daysLeft = Math.round((desiredEndDate.getTime()-todaysDate.getTime())/(1000*60*60*24));
        zenHubApi.getReleaseReportIssues({release_id: release.release_id}).then(data => {
          release.apiIssueCount = data.filter((releaseIssue) => {
            if (releaseIssue.repo_id === zenhubApiRepoId) {
              return releaseIssue;
            }
          }).length

          release.appIssueCount = data.filter((releaseIssue) => {
            if (releaseIssue.repo_id === zenhubAppRepoId) {
              return releaseIssue;
            }
          }).length

          if (index === array.length -1) resolve();
        });
      });
    });

    settingUp.then(() => {
      console.log(filteredReleases);
      
      res.json({
        title: 'Releases',
        data: filteredReleases
      });
    });
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