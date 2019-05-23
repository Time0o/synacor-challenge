'use strict';

var IO = require('./io').IO;
var Mem = require('./mem').Mem;

module.exports = {
    Vm: Vm,
}

function Vm() {
    this.mem = null;
    this.regs = Array(8).fill(0);
    this.stack = [];

    this.pc = 0;
    this.exit = false;

    this.io = new IO();

    const regMin = 32768;
    const regMax = 32775;

    this.immOrReg = function(n) {
        var ret;

        if (n < 0 || n > regMax)
            throw new Error(`Invalid operand: ${n}`);
        else if (n < regMin)
            ret =  n;
        else
            ret = this.regs[n - regMin];

        return ret & 0x7fff;
    }

    this.setReg = function(reg, val) {
        this.regs[reg - regMin] = val;
    }

    this.wrapVal = function(val) {
        return val % regMin;
    }

    this.opcodes = {
        0: this.halt.bind(this),
        1: this.set.bind(this),
        2: this.push.bind(this),
        3: this.pop.bind(this),
        4: this.eq.bind(this),
        5: this.gt.bind(this),
        6: this.jmp.bind(this),
        7: this.jt.bind(this),
        8: this.jf.bind(this),
        9: this.add.bind(this),
        10: this.mult.bind(this),
        11: this.mod.bind(this),
        12: this.and.bind(this),
        13: this.or.bind(this),
        14: this.not.bind(this),
        15: this.rmem.bind(this),
        16: this.wmem.bind(this),
        17: this.call.bind(this),
        18: this.ret.bind(this),
        19: this.out.bind(this),
        20: this.inp.bind(this),
        21: this.noop,
    }
}

Vm.prototype.load = function(file) {
    this.mem = new Mem(file);
}

Vm.prototype.run = function() {
    while (this.pc <= this.mem.maxAddr) {
        if (this.exit)
            break;

        var op = this.mem.read(this.pc);

        if (!(op in this.opcodes))
            throw new Error(`Invalid opcode: ${op}`);

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

Vm.prototype.halt = function() {
    this.exit = true;
}

Vm.prototype.set = function(a, b) {
    this.setReg(a, this.immOrReg(b));
}

Vm.prototype.push = function(a) {
    this.stack.push(this.immOrReg(a));
}

Vm.prototype.pop = function(a) {
    if (this.stack.length == 0)
        throw new Error('Trying to pop from empty stack');

    this.setReg(a, this.stack.pop());
}

Vm.prototype.eq = function(a, b, c) {
    this.setReg(a, (this.immOrReg(b) == this.immOrReg(c)) ? 1 : 0);
}

Vm.prototype.gt = function(a, b, c) {
    this.setReg(a, (this.immOrReg(b) > this.immOrReg(c)) ? 1 : 0);
}

Vm.prototype.jmp = function(a) {
    this.pc = this.immOrReg(a) - 1;
}

Vm.prototype.jt = function(a, b) {
    if (this.immOrReg(a) != 0)
        this.pc = this.immOrReg(b) - 1;
}

Vm.prototype.jf = function(a, b) {
    if (this.immOrReg(a) == 0)
        this.pc = this.immOrReg(b) - 1;
}

Vm.prototype.add = function(a, b, c) {
    this.setReg(a, this.wrapVal(this.immOrReg(b) + this.immOrReg(c)));
}

Vm.prototype.mult = function(a, b, c) {
    this.setReg(a, this.wrapVal(this.immOrReg(b) * this.immOrReg(c)));
}

Vm.prototype.mod = function(a, b, c) {
    this.setReg(a, this.immOrReg(b) % this.immOrReg(c));
}

Vm.prototype.and = function(a, b, c) {
    this.setReg(a, this.immOrReg(b) & this.immOrReg(c));
}

Vm.prototype.or = function(a, b, c) {
    this.setReg(a, this.immOrReg(b) | this.immOrReg(c));
}

Vm.prototype.not = function(a, b) {
    this.setReg(a, ~this.immOrReg(b) & 0x7fff);
}

Vm.prototype.rmem = function(a, b) {
    this.setReg(a, this.mem.read(this.immOrReg(b)));
}

Vm.prototype.wmem = function(a, b) {
    this.mem.write(this.immOrReg(a), this.immOrReg(b));
}

Vm.prototype.call = function(a) {
    this.stack.push(this.pc + 1);
    this.pc = this.immOrReg(a) - 1;
}

Vm.prototype.ret = function() {
    if (this.stack.length == 0)
        this.exit = true;
    else
        this.pc = this.stack.pop() - 1;
}

Vm.prototype.inp = function(a) {
    this.setReg(a, this.io.readChar());
}

Vm.prototype.out = function(a) {
    this.io.writeChar(this.immOrReg(a));
}

Vm.prototype.noop = function() {}
