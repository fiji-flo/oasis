var fs = require('fs');
var RESOLUTION = 1000;

process.on('message', function (m) {
    if (fm.open) {
        fm.stop();
    } else {
        fm.start();
    }
    console.log("gordon got: " + m.text);
});

process.on('SIGINT', function () {
    fm.stop();
    console.log("gordon out!");
});

function readSensors() {
    return [1,2,3,4];
}

function FileManager() {
    this.timer = null;
    this.fileName = "/tmp/log1.csv";
    this.open = false;
}

FileManager.prototype.start = function () {
    console.log("starting timer");
    var self = this;
    this.ws = fs.createWriteStream(this.fileName, {
        flags: 'a',
        encoding: "utf-8"});
    this.open = true;
    this.timer = setInterval(function () { self.update(); }, RESOLUTION);
};

FileManager.prototype.stop = function () {
    console.log("stopping timer");
    clearInterval(this.timer);
    this.ws.end();
}

FileManager.prototype.update = function () {
    var date = (new Date()).getTime();
    var line = date.toString() + ";" + readSensors().join(';') + '\n';
    this.ws.write(line);
};

var fm = new FileManager();
