'use strict';

var question = require('readline-sync').question;

module.exports = {
    IO: IO,
}

function IO() {
    var inputBuf = [];

    this.readChar = function() {
        if (inputBuf.length == 0) {
            var input = question()

            for (var i = 0; i < input.length; ++i)
                inputBuf.push(input.charAt(i));

            inputBuf.push('\n');
        }

        return inputBuf.shift().charCodeAt(0);
    }

    this.writeChar = function(c) {
        process.stdout.write(String.fromCharCode(c));
    }
}
