const winston = require('winston'); 
const { format } = winston;
const { combine, label, json } = format;
const newrelic = require('newrelic');
const newrelicFormatter = require('@newrelic/winston-enricher')(winston)

const express = require('express');
const app = express();
const router = express.Router();

const path = __dirname + '/views/';
const port = 8080;

//LaunchDarkly addition
const LaunchDarkly = require('launchdarkly-node-server-sdk');

// Set featureFlagKey to the feature flag key you want to evaluate.
const featureFlagKey = 'dark-theme';
// Set sdkKey to your LaunchDarkly SDK key.
// const sdkKey = 'sdk-3f2ce257-ecb3-4373-9a48-ac000d67ed86';

const context = {
  "kind": 'user',
  "key": 'user-key-456abc',
  "name": 'nick1'
};

const client = LaunchDarkly.init('sdk-3f2ce257-ecb3-4373-9a48-ac000d67ed86');

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({ level: 'error' }),
    new winston.transports.File({
      filename: 'combined.log',
      level: 'info'
    }),
  ],
  format: combine(
    label({ label: 'Local Test' }),
    json()
  )
});

function showMessage(s) {
  console.log("*** " + s);
  console.log("");
}


router.use(function (req,res,next) {
  console.log('/' + req.method + ' called') ;
  next();
});

router.get('/', function(req,res){
  res.sendFile(path + 'index.html');
});

router.get('/index', function(req,res){
  // return res.status(400).json({message:'Bad Request'});
  // return res.status(500).json({message:'Internal Server Error'});
  //  return res.status(403).json({message:'Forbidden'});
  res.sendFile(path + 'index.html');
});

router.get('/sharks', function(req,res) 
{
  client.waitForInitialization().then(function () {
    showMessage("SDK successfully initialized!");
    client.variation(featureFlagKey, context, false, function (err, flagValue) {
      showMessage("Feature flag '" + featureFlagKey + "' is " + flagValue + " for this context");
      
    if (flagValue) {    
      setTimeout(function() {
        res.sendFile(path + 'sharks2.html');
        logger.log('info', ">>>>>>>  skarks2.html called -- New Image B Test");
      }, 2000);
      
    }
    else {
      setTimeout(function() {
        res.sendFile(path + 'sharks.html');
        logger.log('info', ">>>>>>>  skarks.html called -- Existing Image A Test");
      }, 5000);
      
    }
    });
    }).catch(function (error) {
      showMessage("SDK failed to initialize: " + error);
      process.exit(1);
  });
});

app.use(express.static(path));
app.use('/', router);

app.listen(port, function () {
  console.log('Shark app started on port 8080!')
})

process.on('SIGINT', function() {
    console.log("Got SIGINT ..Exiting .....");
    process.exit();
});
