var request = require('request')
  , CandleModel = require('./models/candleModel')
  , TickModel = require('./models/tickModel')
  , mongoose = require('mongoose')
  , requirejs = require('requirejs');

var LIGHTSTREAMER_PATH = "sdk_client_javascript/alternative_libs/lightstreamer_node.js";

var DB_NAME = "as-filter";
console.log("DB_NAME:" + DB_NAME);
mongoose.connect('mongodb://localhost/'+DB_NAME);

requirejs.config({
deps: [LIGHTSTREAMER_PATH],
nodeRequire: require
});

var urlRoot = "https://demo-api.ig.com/gateway/deal";
var apiKey = process.argv[2];

var cst;
var xSecurityToken;

var identifier = process.argv[3];;
var password = process.argv[4];;

// Create a login request, ie a POST request to /session
var req = {};
req.url = urlRoot + "/session";

// Set up the request body with the user identifier (username) and password
var bodyParams = {};
bodyParams["identifier"] = identifier;
bodyParams["password"] = password;
bodyParams["encryptedPassword"] = null; //peut etre mis à true ! voir ex

var options = {
  url: req.url,
  method: "POST",
  body: JSON.stringify(bodyParams),
  headers: {
     "Content-Type": "application/json; charset=UTF-8",
     "Accept": "application/json; charset=UTF-8",
     "X-IG-API-KEY": apiKey,
     "Version": "2"
  }
};
var req = request(options, function(error, response, body){
  body = JSON.parse(body);

  cst = response.headers["cst"];
  xSecurityToken = response.headers["x-security-token"];

  var lightstreamerEndpoint = body.lightstreamerEndpoint;
  console.log("lightstreamerEndpoint : " + lightstreamerEndpoint);

  var accountId = body.currentAccountId;
  console.log("accountId : " + accountId);
  stream(lightstreamerEndpoint, accountId);
});

//abonnement stream
function stream(lightstreamerEndpoint, accountId){
  requirejs(["LightstreamerClient", "Subscription"], function(LightstreamerClient, Subscription)
  {

    console.log("Connecting to Lighstreamer: " + lightstreamerEndpoint);
    lsClient = new LightstreamerClient(lightstreamerEndpoint);

    // Set up login credentials: client
    lsClient.connectionDetails.setUser(accountId);

    var password = "";
    if (cst) {
        password = "CST-" + cst;
    }
    if (cst && xSecurityToken) {
        password = password + "|";
    }
    if (xSecurityToken) {
        password = password + "XST-" + xSecurityToken
    }
    //console.log(" LSS login " + accountId + " - " + password)
    lsClient.connectionDetails.setPassword(password);

    // Add connection event listener callback functions
    lsClient.addListener({
        onListenStart: function () {
            console.log('Lightstreamer client - start listening');
        },
        onStatusChange: function (status) {
            console.log('Lightstreamer connection status:' + status);
        }
    });

    // Connect to Lightstreamer
    lsClient.connect();
    var subscriptionCandlesMinute = new Subscription(
        "MERGE",
        [
          "CHART:CS.D.AUDJPY.MINI.IP:1MINUTE",
          "CHART:CS.D.AUDUSD.MINI.IP:1MINUTE",
          "CHART:CS.D.CADJPY.MINI.IP:1MINUTE",
          "CHART:CS.D.EURCAD.MINI.IP:1MINUTE",
          "CHART:CS.D.EURCHF.MINI.IP:1MINUTE",
          "CHART:CS.D.EURGBP.MINI.IP:1MINUTE",
          "CHART:CS.D.EURJPY.MINI.IP:1MINUTE",
          "CHART:CS.D.EURUSD.MINI.IP:1MINUTE",
          "CHART:CS.D.GBPJPY.MINI.IP:1MINUTE",
          "CHART:CS.D.GBPUSD.MINI.IP:1MINUTE",
          "CHART:CS.D.USDCAD.MINI.IP:1MINUTE",
          "CHART:CS.D.USDCHF.MINI.IP:1MINUTE",
          "CHART:CS.D.USDJPY.MINI.IP:1MINUTE",
          "CHART:IX.D.CAC.IMF.IP:1MINUTE",
          "CHART:IX.D.DAX.IFMM.IP:1MINUTE",
          "CHART:IX.D.DOW.IFE.IP:1MINUTE",
          "CHART:IX.D.FTSE.IFE.IP:1MINUTE",
          "CHART:IX.D.NASDAQ.IFE.IP:1MINUTE",
          "CHART:CS.D.BITCOIN.CFD.IP:1MINUTE",
          "CHART:CS.D.ETHUSD.CFE.IP:1MINUTE"
        ],
        ["UTM", "OFR_OPEN", "OFR_HIGH", "OFR_LOW", "OFR_CLOSE", "BID_OPEN", "BID_HIGH", "BID_LOW", "BID_CLOSE", "CONS_END", "CONS_TICK_COUNT"] // e.g. {"BID", "OFFER"}
    );

    subscriptionCandlesMinute.addListener({
      onSubscription: function () {
          console.log('subscribed');
      },
      onUnsubscription: function () {
          console.log('unsubscribed');
      },
      onSubscriptionError: function (code, message) {
         console.log('subscription failure: ' + code + " message: " + message);
      },
      onItemUpdate: function (updateInfo){
          // Lightstreamer published some data
          var epic = updateInfo.getItemName().split(":")[1];
          //console.log(epic);
          //"OFR_OPEN", "OFR_HIGH", "OFR_LOW", "OFR_CLOSE", "BID_OPEN", "BID_HIGH", "BID_LOW", "BID_CLOSE"
          var openAsk, openBid, closeAsk, closeBid, highAsk, highBid, lowAsk, lowBid, utm, consEnd, volume;
          updateInfo.forEachField(function (fieldName, fieldPos, value) {
            //console.log('Field: ' + fieldName + " Value: " + value);
            switch (fieldName) {
              case "OFR_OPEN":
                openAsk = parseFloat(value);
                break;
              case "OFR_HIGH":
                highAsk = parseFloat(value);
                break;
              case "OFR_LOW":
                lowAsk = parseFloat(value);
                break;
              case "OFR_CLOSE":
                closeAsk = parseFloat(value);
                break;
              case "BID_OPEN":
                openBid = parseFloat(value);
                break;
              case "BID_HIGH":
                highBid = parseFloat(value);
                break;
              case "BID_LOW":
                lowBid = parseFloat(value);
                break;
              case "BID_CLOSE":
                closeBid = parseFloat(value);
                break;
              case "CONS_TICK_COUNT":
                volume = parseInt(value);
                break;
              case "UTM":
                utm = parseFloat(value);
                break;
              case "CONS_END":
                consEnd = value;
              default:
            }
          });

          if(consEnd == 1){

            var close = (closeAsk + closeBid) / 2
              , open = (openAsk + openBid) / 2
              , high = (highAsk + highBid) / 2
              , low = (lowAsk + lowBid) / 2;
            var newCandle = {
              instrument:epic,
              open: open,
              close: close,
              high: high,
              low: low,
              date: new Date(utm),
              ut: "m1",
              volume: volume
            };
            console.log(newCandle);
            var thing = new CandleModel(newCandle);
            thing.save(function(){
            });
          }

      }
    });

    // Subscribe to Lightstreamer
    lsClient.subscribe(subscriptionCandlesMinute);

    var subscriptionTicks = new Subscription(
        "DISTINCT",
        [
          "CHART:CS.D.AUDJPY.MINI.IP:TICK",
          "CHART:CS.D.AUDUSD.MINI.IP:TICK",
          "CHART:CS.D.CADJPY.MINI.IP:TICK",
          "CHART:CS.D.EURCAD.MINI.IP:TICK",
          "CHART:CS.D.EURCHF.MINI.IP:TICK",
          "CHART:CS.D.EURGBP.MINI.IP:TICK",
          "CHART:CS.D.EURJPY.MINI.IP:TICK",
          "CHART:CS.D.EURUSD.MINI.IP:TICK",
          "CHART:CS.D.GBPJPY.MINI.IP:TICK",
          "CHART:CS.D.GBPUSD.MINI.IP:TICK",
          "CHART:CS.D.USDCAD.MINI.IP:TICK",
          "CHART:CS.D.USDCHF.MINI.IP:TICK",
          "CHART:CS.D.USDJPY.MINI.IP:TICK",
          "CHART:IX.D.CAC.IMF.IP:TICK",
          "CHART:IX.D.DAX.IFMM.IP:TICK",
          "CHART:IX.D.DOW.IFE.IP:TICK",
          "CHART:IX.D.FTSE.IFE.IP:TICK",
          "CHART:IX.D.NASDAQ.IFE.IP:TICK",
          "CHART:CS.D.BITCOIN.CFD.IP:TICK",
          "CHART:CS.D.ETHUSD.CFE.IP:TICK"

        ],
        ["BID","OFR","UTM"] // e.g. {"BID", "OFFER"}
    );

    subscriptionTicks.addListener({
      onSubscription: function () {
          console.log('subscribed');
      },
      onUnsubscription: function () {
          console.log('unsubscribed');
      },
      onSubscriptionError: function (code, message) {
         console.log('subscription failure: ' + code + " message: " + message);
      },
      onItemUpdate: function (updateInfo){
          // Lightstreamer published some data
          var epic = updateInfo.getItemName().split(":")[1];
          var bid, offer, utm;
          updateInfo.forEachField(function (fieldName, fieldPos, value) {
            //console.log('Field: ' + fieldName + " Value: " + value);
            switch (fieldName) {
              case "BID":
                bid = parseFloat(value);
                break;
              case "OFR":
                offer = parseFloat(value);
                break;
              case "UTM":
                utm = parseInt(value);
                break;
              default:
            }
          });

          var newTick = {
            bid:bid,
            offer: offer,
            utm: utm,
            instrument: epic
          };
          console.log(newTick);
          var thing = new TickModel(newTick);
          thing.save(function(){
          });

      }
    });
    // Subscribe to Lightstreamer
    lsClient.subscribe(subscriptionTicks);
  });
}
