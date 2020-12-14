// Miigon 2020-12-14 ShenZhen University

// Native Operations:
// OP   : MODE  USAGE           |   DESCRIPTION
// 1    : RXY   LOAD    R XY    |   load mem(XY) to reg(R)
// 2    : RXY   LOADV   R XY    |   load XY to reg(R)
// 3    : RXY   STORE   R XY    |   store reg(R) to mem(XY)
// 4    : ORS   MOVE    R S     |   move reg(R) to reg(S)
// 5    : RST   ADD     R S T   |   add reg(S) and reg(T) as integer, store the result to reg(R)
// 6    : RST   ADDF    R S T   |   add reg(S) and reg(T) as float, store the result to reg(R)
// 7    : RST   OR      R S T   |   perform bitwise `reg(S) OR reg(T)`, store the result to reg(R)
// 8    : RST   AND     R S T   |   perform bitwise `reg(S) AND reg(T)`, store the result to reg(R)
// 9    : RST   XOR     R S T   |   perform bitwise `reg(S) XOR reg(T)`, store the result to reg(R)
// A    : ROX   ROTATE  R X     |   right-rotate reg(R) for X bits
// B    : RXY   JE      R XY    |   jump to mem(XY) if reg(R) equals reg(0)
// C    : 000   HALT            |   stop execution
// D    : 00R   DEBUGA  R       |   output reg(R) as ascii
// D    : 10R   DEBUG   R       |   output reg(R) as number
// E    : ZXY                   |   reserved for long opcode
// F    : ZXY                   |   reserved for long opcode
// 
// Extended Operations: (Operations that do not directly correspond to a native operation code) 
// USAGE            | DESCRIPTION
// 

const OPERATIONS = {
    'LOAD':     { opcode:'1', mode: 'RXY' },
    'LOADV':    { opcode:'2', mode: 'RXY' },
    'STORE':    { opcode:'3', mode: 'RXY' },
    'MOVE':     { opcode:'4', mode: 'ORS' },
    'ADD':      { opcode:'5', mode: 'RST' },
    'ADDF':     { opcode:'6', mode: 'RST' },
    'OR':       { opcode:'7', mode: 'RST' },
    'AND':      { opcode:'8', mode: 'RST' },
    'XOR':      { opcode:'9', mode: 'RST' },
    'ROTATE':   { opcode:'A', mode: 'ROX' },
    'JE':       { opcode:'B', mode: 'RXY' },
    'HALT':     { opcode:'C', mode: '000' },
    'DEBUGA':   { opcode:'D00', mode: 'R' },
    'DEBUG':    { opcode:'D10', mode: 'R' },
}

function compileAssembly(asm) {
    let ops = asm.split('\n').map(v => v.split('//')[0]).filter(v => v.length>0);
    let output = "";
    for(let op of ops) {
        let part = op.replace(/,/g,' ').split(' ').filter(v => v.length>0);
        let operation = OPERATIONS[part[0]];
        // if(!operation) throw new Error(`unsupported_operation: ${part[0]}`);
        if(!operation) continue;
        let R = part[1] || '';
        let S = part[2] || ''; 
        let T = part[3] || '';
        let XY = part[2] || '';
        output += operation.opcode;
        switch(operation.mode) {
            case 'RXY':
                output += R + ('0'+XY).substr(-2,2);
                break;
            case 'ORS':
                output += "0" + R + S;
                break;
            case 'RST':
                output += R + S + T;
                break;
            case 'ROX':
                output += R + '0' + S;
                break;
            case '000':
                output += '000';
                break;
            case 'R':
                output += R;
                break;
            default: 
                // throw new Error(`unsupported_operation_mode: ${operation.mode}`);
        }
        output += ' ';
    }
    return output;
}
