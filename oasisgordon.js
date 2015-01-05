var fs = require('fs');
var RESOLUTION = 60 * 1000;
var FILELOCATION = '/home/oasis/logs/';
var SENSORPREFIX = '/sys/bus/w1/devices/';
var SENSORS = [
    '28-000005fda813',
    '28-000005fe6622'
];
var SENORFILENAME = 'w1_slave';
var SENSORREGEX = /.*\n.*t=(\d+).*/;

process.on('message', function (m) {
    console.log("gordon got: " + m.text);
});

process.on('SIGINT', function () {
    fm.stop();
    console.log("gordon out!");
});

function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

function readSensor(sensorName) {
    var fileName = SENSORPREFIX + sensorName + '/' + SENORFILENAME;
    var temp = NaN;
    try {
        var s = fs.readFileSync(fileName, {encoding: "utf-8"});
        var groups = s.match(SENSORREGEX);
        if (groups !== null) {
            temp = parseInt(groups[1]);
        }
    }
    catch (e) {
        console.log("unable to read from " + fileName);
    }
    return temp;
}


function readSensors() {
    var temps = [];
    for (var i in SENSORS) {
        var temp = readSensor(SENSORS[i]);
        temps.push(temp);
    }
    return temps;
}

function FileManager() {
    this.timer = null;
    this.running = false;
    this.currentDate = new Date();
    this.ws = null;
    this.openFile(this.currentDate);
}

FileManager.prototype.makeFileName = function (date) {
    var dateString = date.getUTCFullYear() +
        '-' + (date.getUTCMonth() + 1) +
        '-' + date.getUTCDate();
    return FILELOCATION + dateString + '.csv';
}

FileManager.prototype.start = function () {
    console.log("starting timer");
    var self = this;
    this.running = true;
    this.timer = setInterval(function () { self.update(); }, RESOLUTION);
};

FileManager.prototype.stop = function () {
    console.log("stopping timer");
    clearInterval(this.timer);
}

FileManager.prototype.openFile = function (date) {
    var fileName = this.makeFileName(date);
    this.ws = fs.createWriteStream(fileName, {
        flags: 'a',
        encoding: "utf-8"});
};

FileManager.prototype.closeFile = function () {
    this.ws && this.ws.end();
};

FileManager.prototype.isNewDay = function (date) {
    return this.currentDate.getUTCDate() !== date.getUTCDate();
}

FileManager.prototype.changeFile = function (date) {
    if (this.isNewDay(date)) {
        this.closeFile();
        this.openFile(date);
        this.currentDate = date;
    };
}

FileManager.prototype.update = function () {
    var date = new Date();
    this.changeFile(date);
    var line = date.getTime().toString() + ";" + readSensors().join(';') + '\n';
    this.ws.write(line);
};

var fm = new FileManager();
fm.start();
