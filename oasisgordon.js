var fs = require('fs');
var RESOLUTION = 1000;

process.on('message', function (m) {
    fm.start();
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
}

FileManager.prototype.start = function () {
    console.log("starting timer");
    var self = this;
    this.timer = setInterval(self.update, RESOLUTION);
};

FileManager.prototype.stop = function () {
    console.log("stopping timer");
    clearInterval(this.timer);
}

FileManager.prototype.update = function () {
    var date = (new Date()).getTime();
    console.log(date + " " + readSensors);
};

var fm = new FileManager();
