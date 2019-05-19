'use strict';

var Mem = require('./mem').Mem;

module.exports = {
    Vm: Vm,
}

function Vm() {
    this.mem = null;
    this.pc = 0;
}

Vm.prototype.load = function(file) {
    this.mem = new Mem(file);
}

Vm.prototype.run = function() {
    while (this.pc <= this.mem.maxAddr) {
        var op = this.mem.read(this.pc);

        // TODO

        ++this.pc;
    }
}
