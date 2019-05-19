'use strict';

var fs = require('fs');

module.exports = {
    Mem: Mem,
}

function createBuf(file) {
    var buf = fs.readFileSync(file);

    if (buf.byteLength % 2 == 1) {
        // throw away trailing byte
        buf = buf.slice(0, buf.byteLength - 1);
    }

    return buf;
}

function Mem(file) {
    var buf = createBuf(file);

    var maxAllocd = buf.byteLength / 2 - 1;

    this.maxAddr = 2**15 - 1;

    this.read = function(addr) {
        if (addr < 0 || addr > this.maxAddr)
            throw new Error('Invalid Address');
        else if (addr > maxAllocd)
            return 0;
        else
            return buf.readInt16LE(2 * addr);
    }
}
