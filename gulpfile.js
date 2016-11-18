const gulp = require("gulp");
const fs = require("fs");
const exec = require('child_process').exec;

const INJECTION_INPUT = "injection.js";
const INJECTION_OUTPUT = "inc/injection.h";

gulp.task("create-injection", function() {
    fs.readFile(INJECTION_INPUT, function(err, data) {
        if (err) return console.error(err);

        data = data.toString();
        var hex = asciiToHex(data, "0x", "0x00");
        hex = hex.replaceAll(" ", ", ");
        hex = "unsigned char pre[] = { " + hex + " };";

        fs.writeFile(INJECTION_OUTPUT, hex, function(err) {
            if (err) return console.error(err);
            pushToGithub();
        });
    });
});

function asciiToHex(string, delimiter, nullByte) {
    var hexArray = [],
        hex;
    for (var i = 0; i < string.length; ++i) {
        hex = Number(string.charCodeAt(i)).toString(16);
        hex.length == 1 && (hex = "0" + hex);
        hexArray.push(hex);
    }
    return delimiter + hexArray.join(" " + delimiter || "") + " " + nullByte;
}

function pushToGithub() {
    exec("git add . && git commit -m 'Updated injection.h' && git push",
        function(err, stdout, stderr) {
            if (err) return console.error(err);
            if (stdout) return console.log(stdout);
            if (stderr) return console.error(stderr);
        });
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
