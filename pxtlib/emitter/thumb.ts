/* Docs:
 *
 * Thumb 16-bit Instruction Set Quick Reference Card
 *   http://infocenter.arm.com/help/topic/com.arm.doc.qrc0006e/QRC0006_UAL16.pdf 
 *
 * ARMv6-M Architecture Reference Manual (bit encoding of instructions)
 *   http://ecee.colorado.edu/ecen3000/labs/lab3/files/DDI0419C_arm_architecture_v6m_reference_manual.pdf
 *
 * The ARM-THUMB Procedure Call Standard
 *   http://www.cs.cornell.edu/courses/cs414/2001fa/armcallconvention.pdf
 *
 * Cortex-M0 Technical Reference Manual: 3.3. Instruction set summary (cycle counts)
 *   http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.ddi0432c/CHDCICDF.html
 */

namespace ts.pxt.thumb {

    export class ThumbProcessor extends ts.pxt.assembler.EncodersInstructions {

        constructor() {
            super();

            // Registers
            // $r0 - bits 2:1:0
            // $r1 - bits 5:4:3
            // $r2 - bits 7:2:1:0
            // $r3 - bits 6:5:4:3
            // $r4 - bits 8:7:6
            // $r5 - bits 10:9:8

            this.addEnc("$r0", "R0-7", v => this.inrange(7, v, v))
            this.addEnc("$r1", "R0-7", v => this.inrange(7, v, v << 3))
            this.addEnc("$r2", "R0-15", v => this.inrange(15, v, (v & 7) | ((v & 8) << 4)))
            this.addEnc("$r3", "R0-15", v => this.inrange(15, v, v << 3))
            this.addEnc("$r4", "R0-7", v => this.inrange(7, v, v << 6))
            this.addEnc("$r5", "R0-7", v => this.inrange(7, v, v << 8))
            // this for setting both $r0 and $r1 (two argument adds and subs)
            this.addEnc("$r01", "R0-7", v => this.inrange(7, v, (v | v << 3)))

            // Immdiates:
            // $i0 - bits 7-0
            // $i1 - bits 7-0 * 4
            // $i2 - bits 6-0 * 4
            // $i3 - bits 8-6
            // $i4 - bits 10-6
            // $i5 - bits 10-6 * 4
            // $i6 - bits 10-6, 0 is 32
            // $i7 - bits 10-6 * 2

            this.addEnc("$i0", "#0-255", v => this.inrange(255, v, v))
            this.addEnc("$i1", "#0-1020", v => this.inrange(255, v / 4, v >> 2))
            this.addEnc("$i2", "#0-510", v => this.inrange(127, v / 4, v >> 2))
            this.addEnc("$i3", "#0-7", v => this.inrange(7, v, v << 6))
            this.addEnc("$i4", "#0-31", v => this.inrange(31, v, v << 6))
            this.addEnc("$i5", "#0-124", v => this.inrange(31, v / 4, (v >> 2) << 6))
            this.addEnc("$i6", "#1-32", v => v == 0 ? null : v == 32 ? 0 : this.inrange(31, v, v << 6))
            this.addEnc("$i7", "#0-62", v => this.inrange(31, v / 2, (v >> 1) << 6))

            this.addEnc("$rl0", "{R0-7,...}", v => this.inrange(255, v, v))
            this.addEnc("$rl1", "{LR,R0-7,...}", v => (v & 0x4000) ? this.inrange(255, (v & ~0x4000), 0x100 | (v & 0xff)) : this.inrange(255, v, v))
            this.addEnc("$rl2", "{PC,R0-7,...}", v => (v & 0x8000) ? this.inrange(255, (v & ~0x8000), 0x100 | (v & 0xff)) : this.inrange(255, v, v))


            this.addEnc("$la", "LABEL", v => this.inrange(255, v / 4, v >> 2)).isWordAligned = true;
            this.addEnc("$lb", "LABEL", v => this.inrangeSigned(127, v / 2, v >> 1))
            this.addEnc("$lb11", "LABEL", v => this.inrangeSigned(1023, v / 2, v >> 1))

            //this.addInst("nop",                   0xbf00, 0xffff);  // we use mov r8,r8 as gcc

            this.addInst("adcs  $r0, $r1", 0x4140, 0xffc0);
            this.addInst("add   $r2, $r3", 0x4400, 0xff00, "$r2 += $r3");
            this.addInst("add   $r5, pc, $i1", 0xa000, 0xf800);
            this.addInst("add   $r5, sp, $i1", 0xa800, 0xf800);
            this.addInst("add   sp, $i2", 0xb000, 0xff80);
            this.addInst("adds  $r0, $r1, $i3", 0x1c00, 0xfe00);
            this.addInst("adds  $r0, $r1, $r4", 0x1800, 0xfe00);
            this.addInst("adds  $r01, $r4", 0x1800, 0xfe00);
            this.addInst("adds  $r5, $i0", 0x3000, 0xf800, "$r5 += $i0");
            this.addInst("adr   $r5, $la", 0xa000, 0xf800);
            this.addInst("ands  $r0, $r1", 0x4000, 0xffc0);
            this.addInst("asrs  $r0, $r1", 0x4100, 0xffc0);
            this.addInst("asrs  $r0, $r1, $i6", 0x1000, 0xf800);
            this.addInst("bics  $r0, $r1", 0x4380, 0xffc0);
            this.addInst("bkpt  $i0", 0xbe00, 0xff00);
            this.addInst("blx   $r3", 0x4780, 0xff87);
            this.addInst("bx    $r3", 0x4700, 0xff80);
            this.addInst("cmn   $r0, $r1", 0x42c0, 0xffc0);
            this.addInst("cmp   $r0, $r1", 0x4280, 0xffc0);
            this.addInst("cmp   $r2, $r3", 0x4500, 0xff00);
            this.addInst("cmp   $r5, $i0", 0x2800, 0xf800);
            this.addInst("eors  $r0, $r1", 0x4040, 0xffc0);
            this.addInst("ldmia $r5!, $rl0", 0xc800, 0xf800);
            this.addInst("ldmia $r5, $rl0", 0xc800, 0xf800);
            this.addInst("ldr   $r0, [$r1, $i5]", 0x6800, 0xf800);
            this.addInst("ldr   $r0, [$r1, $r4]", 0x5800, 0xfe00);
            this.addInst("ldr   $r5, [pc, $i1]", 0x4800, 0xf800);
            this.addInst("ldr   $r5, $la", 0x4800, 0xf800);
            this.addInst("ldr   $r5, [sp, $i1]", 0x9800, 0xf800);
            this.addInst("ldrb  $r0, [$r1, $i4]", 0x7800, 0xf800);
            this.addInst("ldrb  $r0, [$r1, $r4]", 0x5c00, 0xfe00);
            this.addInst("ldrh  $r0, [$r1, $i7]", 0x8800, 0xf800);
            this.addInst("ldrh  $r0, [$r1, $r4]", 0x5a00, 0xfe00);
            this.addInst("ldrsb $r0, [$r1, $r4]", 0x5600, 0xfe00);
            this.addInst("ldrsh $r0, [$r1, $r4]", 0x5e00, 0xfe00);
            this.addInst("lsls  $r0, $r1", 0x4080, 0xffc0, "$r0 = $r0 << $r1");
            this.addInst("lsls  $r0, $r1, $i4", 0x0000, 0xf800, "$r0 = $r1 << $i4");
            this.addInst("lsrs  $r0, $r1", 0x40c0, 0xffc0);
            this.addInst("lsrs  $r0, $r1, $i6", 0x0800, 0xf800);
            this.addInst("mov   $r0, $r1", 0x4600, 0xffc0, "$r0 = $r1");
            //this.addInst("mov   $r2, $r3",        0x4600, 0xff00);
            this.addInst("movs  $r0, $r1", 0x0000, 0xffc0, "$r0 = $r1");
            this.addInst("movs  $r5, $i0", 0x2000, 0xf800, "$r5 = $i0");
            this.addInst("muls  $r0, $r1", 0x4340, 0xffc0);
            this.addInst("mvns  $r0, $r1", 0x43c0, 0xffc0);
            this.addInst("negs  $r0, $r1", 0x4240, 0xffc0, "$r0 = -$r1");
            this.addInst("nop", 0x46c0, 0xffff); // mov r8, r8
            this.addInst("orrs  $r0, $r1", 0x4300, 0xffc0);
            this.addInst("pop   $rl2", 0xbc00, 0xfe00);
            this.addInst("push  $rl1", 0xb400, 0xfe00);
            this.addInst("rev   $r0, $r1", 0xba00, 0xffc0);
            this.addInst("rev16 $r0, $r1", 0xba40, 0xffc0);
            this.addInst("revsh $r0, $r1", 0xbac0, 0xffc0);
            this.addInst("rors  $r0, $r1", 0x41c0, 0xffc0);
            this.addInst("sbcs  $r0, $r1", 0x4180, 0xffc0);
            this.addInst("sev", 0xbf40, 0xffff);
            this.addInst("stmia $r5!, $rl0", 0xc000, 0xf800);
            this.addInst("str   $r0, [$r1, $i5]", 0x6000, 0xf800);
            this.addInst("str   $r0, [$r1, $r4]", 0x5000, 0xfe00);
            this.addInst("str   $r5, [sp, $i1]", 0x9000, 0xf800);
            this.addInst("strb  $r0, [$r1, $i4]", 0x7000, 0xf800);
            this.addInst("strb  $r0, [$r1, $r4]", 0x5400, 0xfe00);
            this.addInst("strh  $r0, [$r1, $i7]", 0x8000, 0xf800);
            this.addInst("strh  $r0, [$r1, $r4]", 0x5200, 0xfe00);
            this.addInst("sub   sp, $i2", 0xb080, 0xff80);
            this.addInst("subs  $r0, $r1, $i3", 0x1e00, 0xfe00);
            this.addInst("subs  $r0, $r1, $r4", 0x1a00, 0xfe00);
            this.addInst("subs  $r01, $r4", 0x1a00, 0xfe00);
            this.addInst("subs  $r5, $i0", 0x3800, 0xf800);
            this.addInst("svc   $i0", 0xdf00, 0xff00);
            this.addInst("sxtb  $r0, $r1", 0xb240, 0xffc0);
            this.addInst("sxth  $r0, $r1", 0xb200, 0xffc0);
            this.addInst("tst   $r0, $r1", 0x4200, 0xffc0);
            this.addInst("udf   $i0", 0xde00, 0xff00);
            this.addInst("uxtb  $r0, $r1", 0xb2c0, 0xffc0);
            this.addInst("uxth  $r0, $r1", 0xb280, 0xffc0);
            this.addInst("wfe", 0xbf20, 0xffff);
            this.addInst("wfi", 0xbf30, 0xffff);
            this.addInst("yield", 0xbf10, 0xffff);

            this.addInst("cpsid i", 0xb672, 0xffff);
            this.addInst("cpsie i", 0xb662, 0xffff);

            this.addInst("beq   $lb", 0xd000, 0xff00);
            this.addInst("bne   $lb", 0xd100, 0xff00);
            this.addInst("bcs   $lb", 0xd200, 0xff00);
            this.addInst("bcc   $lb", 0xd300, 0xff00);
            this.addInst("bmi   $lb", 0xd400, 0xff00);
            this.addInst("bpl   $lb", 0xd500, 0xff00);
            this.addInst("bvs   $lb", 0xd600, 0xff00);
            this.addInst("bvc   $lb", 0xd700, 0xff00);
            this.addInst("bhi   $lb", 0xd800, 0xff00);
            this.addInst("bls   $lb", 0xd900, 0xff00);
            this.addInst("bge   $lb", 0xda00, 0xff00);
            this.addInst("blt   $lb", 0xdb00, 0xff00);
            this.addInst("bgt   $lb", 0xdc00, 0xff00);
            this.addInst("ble   $lb", 0xdd00, 0xff00);
            this.addInst("bhs   $lb", 0xd200, 0xff00); // cs
            this.addInst("blo   $lb", 0xd300, 0xff00); // cc

            this.addInst("b     $lb11", 0xe000, 0xf800, "B");
            this.addInst("bal   $lb11", 0xe000, 0xf800, "B");

            // handled specially - 32 bit instruction
            this.addInst("bl    $lb", 0xf000, 0xf800, "BL");
            // this is normally emitted as 'b' but will be emitted as 'bl' if needed
            this.addInst("bb    $lb", 0xe000, 0xf800, "B");
        }


        public is32bit(i: assembler.Instruction) {
            return i.name == "bl" || i.name == "bb";
        }

        public emit32(v: number, actual: string): ts.pxt.assembler.EmitResult {
            if (v % 2) return ts.pxt.assembler.emitErr("uneven BL?", actual);
            let off = v / 2
            assert(off != null)
            if ((off | 0) != off ||
                // we can actually support more but the board has 256k (128k instructions)
                !(-128 * 1024 <= off && off <= 128 * 1024))
                return ts.pxt.assembler.emitErr("jump out of range", actual);

            // note that off is already in instructions, not bytes
            let imm11 = off & 0x7ff
            let imm10 = (off >> 11) & 0x3ff

            return {
                opcode: (off & 0xf0000000) ? (0xf400 | imm10) : (0xf000 | imm10),
                opcode2: (0xf800 | imm11),
                stack: 0,
                numArgs: [v],
                labelName: actual
            }
        }

        public getRelativeLabel(f: assembler.File, s: string, wordAligned = false): number {
            let l = f.lookupLabel(s);
            if (l == null) return null;
            let pc = f.location() + 4
            if (wordAligned) pc = pc & 0xfffffffc
            return l - pc;
        }

        public isPop(opcode: number): boolean {
            return opcode == 0xbc00;
        }

        public isPush(opcode: number): boolean {
            return opcode == 0xb400;
        }

        public peephole(ln: ts.pxt.assembler.Line, lnNext: ts.pxt.assembler.Line, lnNext2: ts.pxt.assembler.Line) {

            let lb11 = this.encoders["$lb11"]
            let lb = this.encoders["$lb"]

            let lnop = ln.getOp()
            let isSkipBranch = false
            if (lnop == "bne" || lnop == "beq") {
                if (lnNext.getOp() == "b" && ln.numArgs[0] == 0)
                    isSkipBranch = true;
                if (lnNext.getOp() == "bb" && ln.numArgs[0] == 2)
                    isSkipBranch = true;
            }

            if (lnop == "bb" && lb11.encode(ln.numArgs[0]) != null) {
                // RULE: bb .somewhere -> b .somewhere (if fits)
                ln.update("b " + ln.words[1])
            } else if (lnop == "b" && ln.numArgs[0] == -2) {
                // RULE: b .somewhere; .somewhere: -> .somewhere:
                ln.update("")
            } else if (lnop == "bne" && isSkipBranch && lb.encode(lnNext.numArgs[0]) != null) {
                // RULE: bne .next; b .somewhere; .next: -> beq .somewhere
                ln.update("beq " + lnNext.words[1])
                lnNext.update("")
            } else if (lnop == "beq" && isSkipBranch && lb.encode(lnNext.numArgs[0]) != null) {
                // RULE: beq .next; b .somewhere; .next: -> bne .somewhere
                ln.update("bne " + lnNext.words[1])
                lnNext.update("")
            } else if (lnop == "push" && lnNext.getOp() == "pop" && ln.numArgs[0] == lnNext.numArgs[0]) {
                // RULE: push {X}; pop {X} -> nothing
                assert(ln.numArgs[0] > 0)
                ln.update("")
                lnNext.update("")
            } else if (lnop == "push" && lnNext.getOp() == "pop" &&
                ln.words.length == 4 &&
                lnNext.words.length == 4) {
                // RULE: push {rX}; pop {rY} -> mov rY, rX
                assert(ln.words[1] == "{")
                ln.update("mov " + lnNext.words[2] + ", " + ln.words[2])
                lnNext.update("")
            } else if (lnNext2 && ln.getOpExt() == "movs $r5, $i0" && lnNext.getOpExt() == "mov $r0, $r1" &&
                ln.numArgs[0] == lnNext.numArgs[1] &&
                clobbersReg(lnNext2, ln.numArgs[0])) {
                // RULE: movs rX, #V; mov rY, rX; clobber rX -> movs rY, #V
                ln.update("movs r" + lnNext.numArgs[0] + ", #" + ln.numArgs[1])
                lnNext.update("")
            } else if (lnop == "pop" && singleReg(ln) >= 0 && lnNext.getOp() == "push" &&
                singleReg(ln) == singleReg(lnNext)) {
                // RULE: pop {rX}; push {rX} -> ldr rX, [sp, #0]
                ln.update("ldr r" + singleReg(ln) + ", [sp, #0]")
                lnNext.update("")
            } else if (lnNext2 && lnop == "push" && singleReg(ln) >= 0 && preservesReg(lnNext, singleReg(ln)) &&
                lnNext2.getOp() == "pop" && singleReg(ln) == singleReg(lnNext2)) {
                // RULE: push {rX}; movs rY, #V; pop {rX} -> movs rY, #V (when X != Y)
                ln.update("")
                lnNext2.update("")
            }
        }

        public registerNo(actual: string) {
            if (!actual) return null;
            actual = actual.toLowerCase()
            switch (actual) {
                case "pc": actual = "r15"; break;
                case "lr": actual = "r14"; break;
                case "sp": actual = "r13"; break;
            }
            let m = /^r(\d+)$/.exec(actual)
            if (m) {
                let r = parseInt(m[1], 10)
                if (0 <= r && r < 16)
                    return r;
            }
            return null;
        }
    }


    // if true then instruction doesn't write r<n> and doesn't read/write memory
    function preservesReg(ln: pxt.assembler.Line, n: number) {
        if (ln.getOpExt() == "movs $r5, $i0" && ln.numArgs[0] != n)
            return true;
        return false;
    }

    function clobbersReg(ln: pxt.assembler.Line, n: number) {
        // TODO add some more
        if (ln.getOp() == "pop" && ln.numArgs[0] & (1 << n))
            return true;
        return false;
    }

    function singleReg(ln: pxt.assembler.Line) {
        assert(ln.getOp() == "push" || ln.getOp() == "pop")
        let k = 0;
        let ret = -1;
        let v = ln.numArgs[0]
        while (v > 0) {
            if (v & 1) {
                if (ret == -1) ret = k;
                else ret = -2;
            }
            v >>= 1;
            k++;
        }
        if (ret >= 0) return ret;
        else return -1;
    }

    export function test() {
        let t = new ThumbProcessor();
        testThumb(t);
    }

    export function testThumb(t: ThumbProcessor) {
        assembler.expectError(t, "lsl r0, r0, #8");
        assembler.expectError(t, "push {pc,lr}");
        assembler.expectError(t, "push {r17}");
        assembler.expectError(t, "mov r0, r1 foo");
        assembler.expectError(t, "movs r14, #100");
        assembler.expectError(t, "push {r0");
        assembler.expectError(t, "push lr,r0}");
        assembler.expectError(t, "pop {lr,r0}");
        assembler.expectError(t, "b #+11");
        assembler.expectError(t, "b #+102400");
        assembler.expectError(t, "bne undefined_label");
        assembler.expectError(t, ".foobar");

        assembler.expect(t,
            "0200      lsls    r0, r0, #8\n" +
            "b500      push    {lr}\n" +
            "2064      movs    r0, #100        ; 0x64\n" +
            "b401      push    {r0}\n" +
            "bc08      pop     {r3}\n" +
            "b501      push    {r0, lr}\n" +
            "bd20      pop {r5, pc}\n" +
            "bc01      pop {r0}\n" +
            "4770      bx      lr\n" +
            "0000      .balign 4\n" +
            "e6c0      .word   -72000\n" +
            "fffe\n")

        assembler.expect(t,
            "4291      cmp     r1, r2\n" +
            "d100      bne     l6\n" +
            "e000      b       l8\n" +
            "1840  l6: adds    r0, r0, r1\n" +
            "4718  l8: bx      r3\n")

        assembler.expect(t,
            "          @stackmark base\n" +
            "b403      push    {r0, r1}\n" +
            "          @stackmark locals\n" +
            "9801      ldr     r0, [sp, locals@1]\n" +
            "b401      push    {r0}\n" +
            "9802      ldr     r0, [sp, locals@1]\n" +
            "bc01      pop     {r0}\n" +
            "          @stackempty locals\n" +
            "9901      ldr     r1, [sp, locals@1]\n" +
            "9102      str     r1, [sp, base@0]\n" +
            "          @stackempty locals\n" +
            "b002      add     sp, #8\n" +
            "          @stackempty base\n")

        assembler.expect(t,
            "b090      sub sp, #4*16\n" +
            "b010      add sp, #4*16\n"
        )

        assembler.expect(t,
            "6261      .string \"abc\"\n" +
            "0063      \n"
        )

        assembler.expect(t,
            "6261      .string \"abcde\"\n" +
            "6463      \n" +
            "0065      \n"
        )

        assembler.expect(t,
            "3042      adds r0, 0x42\n" +
            "1c0d      adds r5, r1, #0\n" +
            "d100      bne #0\n" +
            "2800      cmp r0, #0\n" +
            "6b28      ldr r0, [r5, #48]\n" +
            "0200      lsls r0, r0, #8\n" +
            "2063      movs r0, 0x63\n" +
            "4240      negs r0, r0\n" +
            "46c0      nop\n" +
            "b500      push {lr}\n" +
            "b401      push {r0}\n" +
            "b402      push {r1}\n" +
            "b404      push {r2}\n" +
            "b408      push {r3}\n" +
            "b520      push {r5, lr}\n" +
            "bd00      pop {pc}\n" +
            "bc01      pop {r0}\n" +
            "bc02      pop {r1}\n" +
            "bc04      pop {r2}\n" +
            "bc08      pop {r3}\n" +
            "bd20      pop {r5, pc}\n" +
            "9003      str r0, [sp, #4*3]\n")
    }
}
