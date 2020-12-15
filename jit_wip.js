
function startExecutionJIT(state, p = 0) {
    let output = `
let reg0=0,reg1=0,reg2=0,reg3=0,reg4=0,reg5=0,reg6=0,reg7=0,reg8=0,reg9=0,regA=0,regB=0,regC=0,regD=0,regE=0,regF=0,
mem=new Array(256).fill(0),_=n=>n&0x80?(n&0x7F)-0x80:n,p=${p};
`;
    const reg = n => 'reg'+n.toString(16).toUpperCase();
    const mem = n => 'mem['+n+']';
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
            output += `${reg(para1)}=${mem(byte2)}`
        } else if(opcode == 0x2) { // load XY to reg(R)
            output += `${reg(para1)}=${byte2}`
        } else if(opcode == 0x3) { // store reg(R) to XY
            output += `${mem(byte2)}=${reg(para1)}`
        } else if(opcode == 0x4) { // move reg(R) to reg(S)
            output += `${reg(para3)}=${reg(para2)}`
        } else if(opcode == 0x5) { // add reg(S) and reg(T) as integer, store the result to reg(R)
            output += `${reg(para1)}=_(${reg(para2)})+_(${reg(para3)})`
        } else if(opcode == 0x6) { // add reg(S) and reg(T) as float, store the result to reg(R)
            throw new Error("float_not_implemented");
        } else if(opcode == 0x7) { // perform bitwise `reg(S) OR reg(T)`, store the result to reg(R)
            output += `${reg(para1)}=_(${reg(para2)})|_(${reg(para3)})`
        } else if(opcode == 0x8) { // perform bitwise `reg(S) AND reg(T)`, store the result to reg(R)
            output += `${reg(para1)}=_(${reg(para2)})&_(${reg(para3)})`
        } else if(opcode == 0x9) { // perform bitwise `reg(S) XOR reg(T)`, store the result to reg(R)
            output += `${reg(para1)}=_(${reg(para2)})^_(${reg(para3)})`
        } else if(opcode == 0xA) { // right-rotate reg(R) for X bits
            output += `${reg(para1)}=${reg(para1)}>>${para3}|${reg(para1)}<<8-${para3}`
        } else if(opcode == 0xB) { // jump to mem(XY) if reg(R) equals reg(0)
            output += `${reg(para1)}==reg0&&p=${byte2}`
        } else if(opcode == 0xC) { // stop execution
            
        } else if(byte1 == 0xD0) { // output reg(R) as ascii
            output += String.fromCharCode(state.registers[para3]);
        } else if(byte1 == 0xD1) { // output reg(R) as number
            console.log(_getOriginalFromComplement(state.registers[para3]));
            output += _getOriginalFromComplement(state.registers[para3]);
        }
    }
    return output;
}
