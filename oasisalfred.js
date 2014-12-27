var restify = require('restify');
var fs = require('fs');
var version = '0.1α';

var gordon = require('child_process').fork('oasisgordon.js');

process.on('SIGINT', function() {
    if (gordon.connected) {
        gordon.disconnect();
    }
    console.log("alfred is going home");
    process.exit();
});

function respond(req, res, next) {
    gordon.send({ text: "wtf?!" });
    res.send(version);
    next();
}

function getData(req, res, next) {
    fs.readFile("/etc/resolv.conf", {encoding: "utf-8"}, function (err, data) {
        res.send(data);
        next();
    });}

var server = restify.createServer();
server.get(/\/static\/?.*/, restify.serveStatic({
    directory: __dirname,
    default: 'index.html'
}));
server.get('/oasis', respond);
server.get('/oasis/data', getData);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
