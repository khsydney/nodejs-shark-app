const express = require('express');
const app = express();
const router = express.Router();

const path = __dirname + '/views/';
const port = 8080;

//LaunchDarkly addition
const LaunchDarkly = require('@launchdarkly/node-server-sdk');

// Set featureFlagKey to the feature flag key you want to evaluate.
const featureFlagKey = 'dark-theme';
// Set sdkKey to your LaunchDarkly SDK key.
// const sdkKey = 'sdk-3f2ce257-ecb3-4373-9a48-ac000d67ed86';

const context = {
  "kind": 'user',
  "key": 'user-key-123abc',
  "name": 'nick'
};

const client = LaunchDarkly.init('sdk-3f2ce257-ecb3-4373-9a48-ac000d67ed86');


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

router.get('/sharks', function(req,res){
  client.waitForInitialization().then(function () {
    showMessage("SDK successfully initialized!");
    client.variation(featureFlagKey, context, false, function (err, flagValue) {
      showMessage("Feature flag '" + featureFlagKey + "' is " + flagValue + " for this context");
    if(featureFlagKey)
    {    
      res.sendFile(path + 'sharks2.html');
    }
    else 
    {
      res.sendFile(path + 'sharks.html');
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
