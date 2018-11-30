/**
 * @author Jack Considine <jackconsidine3@gmail.com>
 * @package healthypoints-server2.0
 * 2018-05-23
 */

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');


require('dotenv').config();

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

let SERVER_URL = process.env.SERVER_URL || 'http://localhost:4040/parse';
let MASTER_KEY = process.env.MASTER_KEY || 'myMasterKey';
let APP_ID = process.env.APP_ID || 'myAppId';
let DATABASE_URI = databaseUri || 'mongodb://localhost:27017/dev';
let CLOUD = process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js';
let APP_NAME = process.env.APP_NAME || 'TicketLister';
var api = new ParseServer({
  databaseURI: DATABASE_URI,
  appName: APP_NAME,
  publicServerURL: SERVER_URL,
  cloud: CLOUD,
  appId: APP_ID,
  masterKey: MASTER_KEY, //Add your master key here. Keep it secret!
  serverURL: SERVER_URL, // Don't forget to change to https if needed
  liveQuery: {
    classNames: [] // List of classes to support for query subscriptions
  }
});

var options = { allowInsecureHTTP: true };

var dashboard = new ParseDashboard(
  {
    apps: [
      {
        serverURL: SERVER_URL,
        appId: APP_ID,
        masterKey: MASTER_KEY,
        appName: APP_NAME
      }
    ]
  },
  options
);

var app = express();

router = express.Router();
router.use(express.static('public'));

app.use('/', router);

// make the Parse Server available at /parse
app.use('/parse', api);

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

var httpServer = require('http').createServer(app);
let port;
let urlPath = SERVER_URL.split(':');
urlPath = urlPath[urlPath.length - 1];
port = parseInt(urlPath.split('/')[0]);

httpServer.listen(port, '0.0.0.0');
