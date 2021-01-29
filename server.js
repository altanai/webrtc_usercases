/**
 * Created by IntelliJ IDEA.
 * User: Altanai ( @altanai)
 * Date: 2020
 * Time: 12:54 PM
 */
var fs = require('fs');
var _static = require('node-static');
var https = require('https');
var http2 = require('http2');

var webrtcserver = require('./node_modules/webrtcdevelopment/build/webrtcdevelopmentServer.js');
console.log(" __dirname " + __dirname);

var properties = {
    hostname: "host",
    enviornment: "prod",
    host: "localhost",
    jsdebug: true,
    httpsPort: 8082,
    http2Port: 8084,
    wssPort: 8083,
    restPort: 8087,
    key: __dirname + '/fake-keys/privatekey.pem',
    cert: __dirname + '/fake-keys/certificate.pem',
    ca: __dirname + '/fake-keys/certificate.pem'
};

// duration to 31536000, which corresponds to 1 year: 60 seconds × 60 minutes × 24 hours × 365 days = 31536000 seconds
var file = new _static.Server("./", {
    cache: 31536000,
    gzip: true,
    indexFile: "index.html"
});

var options = {
    key: fs.readFileSync(properties.key),
    cert: fs.readFileSync(properties.cert),
    ca: fs.readFileSync(properties.ca),
    requestCert: true,
    rejectUnauthorized: false
};

const app = http2.createSecureServer(options, (request, response) => {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
});
app.on('error', (err) => console.error(err));
app.on('session', (session) => {
    console.log("webserver state ", app.state);
});
app.listen(properties.http2Port);
console.log("< ------------------------ HTTPS Server -------------------> ");
console.log(" Web server env => " + properties.enviornment + " running at " + properties.http2Port);



// WSS Server
var _realtimecomm = webrtcserver.realtimecomm;
var realtimecomm = _realtimecomm(properties, options, null, (socket) => {
    try {
        var params = socket.handshake.query;

        if (!params.socketCustomEvent) {
            params.socketCustomEvent = 'custom-message';
        }

        socket.on(params.socketCustomEvent, function (message) {
            try {
                socket.broadcast.emit(params.socketCustomEvent, message);
            } catch (e) {
                // Raven.captureException(e);
                console.error(e);
            }
        });
    } catch (e) {
        // Raven.captureException(e);
        console.error(e);
    }
});

// REST API server
var _restapi = webrtcserver.restapi;
var restapi = _restapi(realtimecomm, options, app, properties);