const gulp = require("gulp");
const fs = require("fs");
const exec = require('child_process').exec;

const INJECTION_INPUT = "injection.js";
const INJECTION_OUTPUT = "inc/injection.h";

gulp.task("create-injection", function() {
    fs.readFile(INJECTION_INPUT, function(err, data) {
        if (err) return console.error(err);

        data = data.toString();
        var hex = asciiToHex(data, "0x00");

        fs.writeFile(INJECTION_OUTPUT, hex, function(err, data) {
            if (err) return console.error(err);
            pushToGithub();
        });
    });
});

function asciiToHex(string, delimiter) {
    var hex = [];
    for (var i in string) {
        hex.push(Number(string.charCodeAt(i)).toString(16));
    }
    return hex.join(" " + delimiter || "");
}

function pushToGithub() {
    exec("git add . && git commit -m 'Updated injection.h' && git push",
        function(err, stdout, stderr) {
            if (err) return console.error(err);
            if (stdout) return console.log(stdout);
            if (stderr) return console.error(stderr);
        });
}
