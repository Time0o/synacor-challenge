'use strict';

var Mem = require('./mem').Mem;

module.exports = {
    Vm: Vm,
}

function Vm() {
    this.mem = null;
    this.pc = 0;

    this.opcodes = {
        19: this.out,
        21: this.noop,
    }
}

Vm.prototype.load = function(file) {
    this.mem = new Mem(file);
}

Vm.prototype.run = function() {
    while (this.pc <= this.mem.maxAddr) {
        var op = this.mem.read(this.pc);

        if (op == 0)
            break;

        if (!(op in this.opcodes))
            throw new Error(`invalid opcode: ${op}`);

        // find instruction
        var f = this.opcodes[op];

        // read arguments
        var args = [];
        for (var i = 0; i < f.length; ++i)
            args.push(this.mem.read(++this.pc));

        // run instruction
        f(...args);

        ++this.pc;
    }
}

Vm.prototype.out = function(c) {
    process.stdout.write(String.fromCharCode(c));
}

Vm.prototype.noop = function() {}
