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
    'LJE':      { opcode:'B', mode: 'RLB' },
    'HALT':     { opcode:'C', mode: '000' },
    'DEBUGA':   { opcode:'D00', mode: 'R' },
    'DEBUG':    { opcode:'D10', mode: 'R' },
}

const _addPaddingZero = n => ('0'+n).substr(-2,2)
const _toHex = n => _addPaddingZero((n).toString(16).toUpperCase())

function compileAssembly(asm) {
    let ops = asm.split('\n').map(v => v.split('//')[0]).filter(v => v.length>0);
    let labelMap = {};
    
    // STAGE 1
    let stage1output = "";
    let currentAddress = 0;
    for(const i of ops.keys()) {
        let op = ops[i];
        let part = op.replace(/,/g,' ').split(' ').filter(v => v.length>0);

        if(part && part[0] && part[0][0] == ":") { // Label
            let labelName = part[0].substr(1);
            // if(labelMap[labelName]) throw new Error(`label redefinition: ${labelName}`);
            labelMap[labelName] = currentAddress;
        } else { // Operation
            let operation = OPERATIONS[part[0]];
            // if(!operation) throw new Error(`unsupported_operation: ${part[0]}`);
            if(!operation) continue;
            let R = part[1] || '';
            let S = part[2] || ''; 
            let T = part[3] || '';
            let XY = part[2] || '';
            let LB = XY;
            stage1output += operation.opcode;
            switch(operation.mode) {
                case 'RXY':
                    stage1output += R + _addPaddingZero(XY);
                    break;
                case 'ORS':
                    stage1output += "0" + R + S;
                    break;
                case 'RST':
                    stage1output += R + S + T;
                    break;
                case 'ROX':
                    stage1output += R + '0' + S;
                    break;
                case '000':
                    stage1output += '000';
                    break;
                case 'R':
                    stage1output += R;
                    break;
                case 'RLB': // R and a Label
                    stage1output += R + `:${LB}:`;
                default: 
                    // throw new Error(`unsupported_operation_mode: ${operation.mode}`);
            }
            stage1output += ' ';
            currentAddress += 2;
        }
    }
    let stage2output = stage1output;
    for(let m of stage1output.matchAll(/:(.*?):/g)) {
        let labelName = m[1];
        let labelAddress = labelMap[labelName];
        // if(!labelName) throw new Error(`invalid label reference: ${m[0]}`);
        // if(!labelMap[labelName]) throw new Error(`undefined label: ${m[0]}`);
        if(!labelMap[labelName]) continue;
        stage2output = stage2output.replace(/:(.*?):/, _toHex(labelAddress)) // this is not the best way to do it. some optimization can be done here.

    }
    return stage2output;
}
