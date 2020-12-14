// Miigon 2020-12-14 ShenZhen University

const _getOriginalFromComplement = n => n & 0x80 ? (n & 0x7F) - 0x80 : n;

function newVmState() {
    return {
        registers:  new Array(16).fill(0),
        memory:     new Array(256).fill(0),
        p:          0,
    };
}

function loadProgram(state, prog, position = 0) {
    let bytes = prog.replace(/\s/g,'').match(/.{1,2}/g);
    console.log(bytes)
    for(let i in bytes) {
        state.memory[position + Number(i)] = Number("0x" + bytes[Number(i)]);
    }
}

function startExecution(state, p = 0) {
    let output = "";
    state.p = p;
    while(state.p < 256) {
        let byte1 = state.memory[state.p];
        let byte2 = state.memory[state.p+1];
        let opcode = byte1 >> 4;
        let para1 = byte1 & 0x0F;
        let para2 = byte2 >> 4;
        let para3 = byte2 & 0x0F;
        state.p += 2;

        if(opcode == 0x0) { // nop
            // do nothing
        } else if(opcode == 0x1) { // load mem(XY) to reg(R)
            state.registers[para1] = state.memory[byte2];
        } else if(opcode == 0x2) { // load XY to reg(R)
            state.registers[para1] = byte2;
        } else if(opcode == 0x3) { // store reg(R) to XY
            state.memory[byte2] = state.registers[para1];
        } else if(opcode == 0x4) { // move reg(R) to reg(S)
            state.registers[para3] = state.registers[para2];
        } else if(opcode == 0x5) { // add reg(S) and reg(T) as integer, store the result to reg(R)
            state.registers[para1] = _getOriginalFromComplement(state.registers[para2]) + _getOriginalFromComplement(state.registers[para3]);
        } else if(opcode == 0x6) { // add reg(S) and reg(T) as float, store the result to reg(R)
            throw new Error("float_not_implemented");
        } else if(opcode == 0x7) { // perform bitwise `reg(S) OR reg(T)`, store the result to reg(R)
            state.registers[para1] = state.registers[para2] | state.registers[para3];
        } else if(opcode == 0x8) { // perform bitwise `reg(S) AND reg(T)`, store the result to reg(R)
            state.registers[para1] = state.registers[para2] & state.registers[para3];
        } else if(opcode == 0x9) { // perform bitwise `reg(S) XOR reg(T)`, store the result to reg(R)
            state.registers[para1] = state.registers[para2] ^ state.registers[para3];
        } else if(opcode == 0xA) { // right-rotate reg(R) for X bits
            let value = state.registers[para1];
            state.registers[para1] = (value >> para3) | (value << 8 - para3);
        } else if(opcode == 0xB) { // jump to mem(XY) if reg(R) equals reg(0)
            if(state.registers[para1] == state.registers[0]) state.p = byte2;
        } else if(opcode == 0xC) { // stop execution
            state.p = 256;
        } else if(byte1 == 0xD0) { // output reg(R) as ascii
            output += String.fromCharCode(state.registers[para3]);
        } else if(byte1 == 0xD1) { // output reg(R) as number
            output += _getOriginalFromComplement(state.registers[para3]);
        }
    }
    return output;
}
