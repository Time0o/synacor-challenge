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

    this.checkAddr = function(addr) {
        if (addr < 0 || addr > this.maxAddr)
            throw new Error('Invalid Address');
    }

    this.read = function(addr) {
        this.checkAddr(addr);

        if (addr > maxAllocd)
            return 0;
        else
            return buf.readUInt16LE(2 * addr);
    }

    this.write = function(addr, val) {
        this.checkAddr(addr);

        if (addr > maxAllocd) {
            buf = Buffer.concat([buf, Buffer.alloc(2 * (addr - maxAllocd))]);
            maxAllocd = addr;
        }

        buf.writeUInt16LE(val, 2 * addr);
    }
}
