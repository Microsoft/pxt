interface TypeOptions {
    union?: Type;
    classType?: py.ClassDef;
    primType?: string;
    arrayType?: Type;
}

interface Type extends TypeOptions {
    tid: number;
}

interface FieldDesc {
    name: string;
    type: Type;
    fundef?: py.FunctionDef;
    isStatic?: boolean;
}

type Map<T> = pxt.Map<T>;

module py {
    // based on grammar at https://docs.python.org/3/library/ast.html
    export interface AST {
        lineno: number;
        col_offset: number;
        kind: string;
    }
    export interface Stmt extends AST {
        _stmtBrand: void;
    }
    export interface Symbol extends Stmt {
        _symbolBrand: void;
    }
    export interface Expr extends AST {
        tsType?: Type;
        _exprBrand: void;
    }

    export type expr_context = "Load" | "Store" | "Del" | "AugLoad" | "AugStore" | "Param"
    export type boolop = "And" | "Or"
    export type operator = "Add" | "Sub" | "Mult" | "MatMult" | "Div" | "Mod" | "Pow"
        | "LShift" | "RShift" | "BitOr" | "BitXor" | "BitAnd" | "FloorDiv"
    export type unaryop = "Invert" | "Not" | "UAdd" | "USub"
    export type cmpop = "Eq" | "NotEq" | "Lt" | "LtE" | "Gt" | "GtE" | "Is" | "IsNot" | "In" | "NotIn"

    export type identifier = string
    export type int = number

    export interface Arg extends AST {
        kind: "Arg";
        arg: identifier;
        annotation?: Expr;
        type?: Type;
    }

    export interface Arguments extends AST {
        kind: "Arguments";
        args: Arg[];
        vararg?: Arg;
        kwonlyargs: Arg[];
        kw_defaults: Expr[];
        kwarg?: Arg;
        defaults: Expr[];
    }

    // keyword arguments supplied to call (NULL identifier for **kwargs)
    export interface Keyword extends AST {
        kind: "Keyword";
        arg?: identifier;
        value: Expr;
    }

    export interface Comprehension extends AST {
        kind: "Comprehension";
        target: Expr;
        iter: Expr;
        ifs: Expr[];
        is_async: int;
    }

    export interface Module extends Symbol, ScopeDef {
        kind: "Module";
        name?: string;
        body: Stmt[];
    }

    export interface ExceptHandler extends AST {
        kind: "ExceptHandler";
        type?: Expr;
        name?: identifier;
        body: Stmt[];
    }

    // import name with optional 'as' alias.
    export interface Alias extends AST {
        kind: "Alias";
        name: identifier;
        asname?: identifier;
    }

    export interface WithItem extends AST {
        kind: "WithItem";
        context_expr: Expr;
        optional_vars?: Expr;
    }

    export interface AnySlice extends AST {
        _anySliceBrand: void;
    }
    export interface Slice extends AnySlice {
        kind: "Slice";
        lower?: Expr;
        upper?: Expr;
        step?: Expr;
    }
    export interface ExtSlice extends AnySlice {
        kind: "ExtSlice";
        dims: AnySlice[];
    }
    export interface Index extends AnySlice {
        kind: "Index";
        value: Expr;
    }

    export interface ScopeDef extends Stmt {
        vars?: Map<VarDesc>;
        parent?: ScopeDef;
    }

    export interface FunctionDef extends Symbol, ScopeDef {
        kind: "FunctionDef";
        name: identifier;
        args: Arguments;
        body: Stmt[];
        decorator_list: Expr[];
        returns?: Expr;
        retType?: Type;
    }
    export interface AsyncFunctionDef extends Stmt {
        kind: "AsyncFunctionDef";
        name: identifier;
        args: Arguments;
        body: Stmt[];
        decorator_list: Expr[];
        returns?: Expr;
    }
    export interface ClassDef extends Symbol, ScopeDef {
        kind: "ClassDef";
        name: identifier;
        bases: Expr[];
        keywords: Keyword[];
        body: Stmt[];
        decorator_list: Expr[];
        fields?: Map<FieldDesc>;
        baseClass?: ClassDef;
    }
    export interface Return extends Stmt {
        kind: "Return";
        value?: Expr;
    }
    export interface Delete extends Stmt {
        kind: "Delete";
        targets: Expr[];
    }
    export interface Assign extends Symbol {
        kind: "Assign";
        targets: Expr[];
        value: Expr;
    }
    export interface AugAssign extends Stmt {
        kind: "AugAssign";
        target: Expr;
        op: operator;
        value: Expr;
    }
    export interface AnnAssign extends Stmt {
        kind: "AnnAssign";
        target: Expr;
        annotation: Expr;
        value?: Expr;
        simple: int; // 'simple' indicates that we annotate simple name without parens

    }
    export interface For extends Stmt {
        kind: "For";
        target: Expr;
        iter: Expr;
        body: Stmt[];
        orelse: Stmt[]; // use 'orelse' because else is a keyword in target languages
    }
    export interface AsyncFor extends Stmt {
        kind: "AsyncFor";
        target: Expr;
        iter: Expr;
        body: Stmt[];
        orelse: Stmt[];
    }
    export interface While extends Stmt {
        kind: "While";
        test: Expr;
        body: Stmt[];
        orelse: Stmt[];
    }
    export interface If extends Stmt {
        kind: "If";
        test: Expr;
        body: Stmt[];
        orelse: Stmt[];
    }
    export interface With extends Stmt {
        kind: "With";
        items: WithItem[];
        body: Stmt[];
    }
    export interface AsyncWith extends Stmt {
        kind: "AsyncWith";
        items: WithItem[];
        body: Stmt[];
    }
    export interface Raise extends Stmt {
        kind: "Raise";
        exc?: Expr;
        cause?: Expr;
    }
    export interface Try extends Stmt {
        kind: "Try";
        body: Stmt[];
        handlers: ExceptHandler[];
        orelse: Stmt[];
        finalbody: Stmt[];
    }
    export interface Assert extends Stmt {
        kind: "Assert";
        test: Expr;
        msg?: Expr;
    }
    export interface Import extends Stmt {
        kind: "Import";
        names: Alias[];
    }
    export interface ImportFrom extends Stmt {
        kind: "ImportFrom";
        module?: identifier;
        names: Alias[];
        level?: int;
    }
    export interface Global extends Stmt {
        kind: "Global";
        names: identifier[];
    }
    export interface Nonlocal extends Stmt {
        kind: "Nonlocal";
        names: identifier[];
    }
    export interface ExprStmt extends Stmt {
        kind: "ExprStmt";
        value: Expr;
    }
    export interface Pass extends Stmt {
        kind: "Pass";
    }
    export interface Break extends Stmt {
        kind: "Break";
    }
    export interface Continue extends Stmt {
        kind: "Continue";
    }


    export interface BoolOp extends Expr {
        kind: "BoolOp";
        op: boolop;
        values: Expr[];
    }
    export interface BinOp extends Expr {
        kind: "BinOp";
        left: Expr;
        op: operator;
        right: Expr;
    }
    export interface UnaryOp extends Expr {
        kind: "UnaryOp";
        op: unaryop;
        operand: Expr;
    }
    export interface Lambda extends Expr {
        kind: "Lambda";
        args: Arguments;
        body: Expr;
    }
    export interface IfExp extends Expr {
        kind: "IfExp";
        test: Expr;
        body: Expr;
        orelse: Expr;
    }
    export interface Dict extends Expr {
        kind: "Dict";
        keys: Expr[];
        values: Expr[];
    }
    export interface Set extends Expr {
        kind: "Set";
        elts: Expr[];
    }
    export interface ListComp extends Expr {
        kind: "ListComp";
        elt: Expr;
        generators: Comprehension[];
    }
    export interface SetComp extends Expr {
        kind: "SetComp";
        elt: Expr;
        generators: Comprehension[];
    }
    export interface DictComp extends Expr {
        kind: "DictComp";
        key: Expr;
        value: Expr;
        generators: Comprehension[];
    }
    export interface GeneratorExp extends Expr {
        kind: "GeneratorExp";
        elt: Expr;
        generators: Comprehension[];
    }
    export interface Await extends Expr {
        kind: "Await";
        value: Expr;
    }
    export interface Yield extends Expr {
        kind: "Yield";
        value?: Expr;
    }
    export interface YieldFrom extends Expr {
        kind: "YieldFrom";
        value: Expr;
    }
    // need sequences for compare to distinguish between x < 4 < 3 and (x < 4) < 3
    export interface Compare extends Expr {
        kind: "Compare";
        left: Expr;
        ops: cmpop[];
        comparators: Expr[];
    }
    export interface Call extends Expr {
        kind: "Call";
        func: Expr;
        args: Expr[];
        keywords: Keyword[];
    }
    export interface Num extends Expr {
        kind: "Num";
        n: number;
    }
    export interface Str extends Expr {
        kind: "Str";
        s: string;
    }
    export interface FormattedValue extends Expr {
        kind: "FormattedValue";
        value: Expr;
        conversion?: int;
        format_spec?: Expr;
    }
    export interface JoinedStr extends Expr {
        kind: "JoinedStr";
        values: Expr[];
    }
    export interface Bytes extends Expr {
        kind: "Bytes";
        s: number[];
    }
    export interface NameConstant extends Expr {
        kind: "NameConstant";
        value: boolean; // null=None, True, False
    }
    export interface Ellipsis extends Expr {
        kind: "Ellipsis";
    }
    export interface Constant extends Expr {
        kind: "Constant";
        value: any; // ??? 
    }

    // the following expression can appear in assignment context
    export interface AssignmentExpr extends Expr { }
    export interface Attribute extends AssignmentExpr {
        kind: "Attribute";
        value: Expr;
        attr: identifier;
        ctx: expr_context;
    }
    export interface Subscript extends AssignmentExpr {
        kind: "Subscript";
        value: Expr;
        slice: AnySlice;
        ctx: expr_context;
    }
    export interface Starred extends AssignmentExpr {
        kind: "Starred";
        value: Expr;
        ctx: expr_context;
    }
    export interface Name extends AssignmentExpr {
        kind: "Name";
        id: identifier;
        ctx: expr_context;
        isdef?: boolean;
    }
    export interface List extends AssignmentExpr {
        kind: "List";
        elts: Expr[];
        ctx: expr_context;
    }
    export interface Tuple extends AssignmentExpr {
        kind: "Tuple";
        elts: Expr[];
        ctx: expr_context;
    }
}


import * as nodeutil from './nodeutil';
import * as fs from 'fs';
import U = pxt.Util;
import B = pxt.blocks;

const convPy = `
import ast
import sys
import json

def to_json(val):
    if val is None or isinstance(val, (bool, str, int, float)):
        return val
    if isinstance(val, list):
        return [to_json(x) for x in val]
    if isinstance(val, ast.AST):
        js = dict()
        js['kind'] = val.__class__.__name__
        for attr_name in dir(val):
            if not attr_name.startswith("_"):
                js[attr_name] = to_json(getattr(val, attr_name))
        return js    
    if isinstance(val, (bytearray, bytes)):
        return [x for x in val]
    raise Exception("unhandled: %s (type %s)" % (val, type(val)))

js = dict()
for fn in @files@:
    js[fn] = to_json(ast.parse(open(fn, "r").read()))
print(json.dumps(js))
`

const nameMap: Map<string> = {
    "Expr": "ExprStmt",
    "arg": "Arg",
    "arguments": "Arguments",
    "keyword": "Keyword",
    "comprehension": "Comprehension",
    "alias": "Alias",
    "withitem": "WithItem"
}

const simpleNames: Map<boolean> = {
    "Load": true, "Store": true, "Del": true, "AugLoad": true, "AugStore": true, "Param": true, "And": true,
    "Or": true, "Add": true, "Sub": true, "Mult": true, "MatMult": true, "Div": true, "Mod": true, "Pow": true,
    "LShift": true, "RShift": true, "BitOr": true, "BitXor": true, "BitAnd": true, "FloorDiv": true,
    "Invert": true, "Not": true, "UAdd": true, "USub": true, "Eq": true, "NotEq": true, "Lt": true, "LtE": true,
    "Gt": true, "GtE": true, "Is": true, "IsNot": true, "In": true, "NotIn": true,
}

function stmtTODO(v: py.Stmt) {
    return B.mkStmt(B.mkText("TODO: " + v.kind))
}

function exprTODO(v: py.Expr) {
    return B.mkText(" {TODO: " + v.kind + "} ")
}

function docComment(cmt: string) {
    if (cmt.trim().split(/\n/).length <= 1)
        cmt = cmt.trim()
    else
        cmt = cmt + "\n"
    return B.mkStmt(B.mkText("/** " + cmt + " */"))
}

let moduleAst: Map<py.Module> = {}

function lookupSymbol(name: string): py.Symbol {
    if (!name) return null
    if (moduleAst[name])
        return moduleAst[name]
    let parts = name.split(".")
    if (parts.length >= 2) {
        let last = parts.length - 1
        let par = moduleAst[parts.slice(0, last).join(".")]
        let ename = parts[last]
        if (par) {
            for (let stmt of par.body) {
                if (stmt.kind == "ClassDef" || stmt.kind == "FunctionDef") {
                    if ((stmt as py.FunctionDef).name == ename)
                        return stmt as py.FunctionDef
                }
                if (stmt.kind == "Assign") {
                    let assignment = stmt as py.Assign
                    if (assignment.targets.length == 1 && getName(assignment.targets[0]) == ename) {
                        return assignment
                    }
                }
            }
        }
    }
    return null
}

interface VarDescOptions {
    expandsTo?: string;
    isImportStar?: boolean;
    isPlainImport?: boolean;
    isLocal?: boolean;
    isParam?: boolean;
    fundef?: py.FunctionDef;
    classdef?: py.ClassDef;
}

interface VarDesc extends VarDescOptions {
    type: Type;
}

interface Ctx {
    currModule: py.Module;
    currClass: py.ClassDef;
    currFun: py.FunctionDef;
}

let ctx: Ctx

let typeId = 0
let numUnifies = 0
function mkType(o: TypeOptions = {}) {
    let r: Type = U.flatClone(o) as any
    r.tid = ++typeId
    return r
}

function currentScope(): py.ScopeDef {
    return ctx.currFun || ctx.currClass || ctx.currModule
}

function defvar(n: string, opts: VarDescOptions) {
    let scopeDef = currentScope()
    let v = scopeDef.vars[n]
    if (!v) {
        v = scopeDef.vars[n] = { type: mkType() }
    }
    for (let k of Object.keys(opts)) {
        (v as any)[k] = (opts as any)[k]
    }
    return v
}

let tpString: Type = mkType({ primType: "string" })
let tpNumber: Type = mkType({ primType: "number" })
let tpBoolean: Type = mkType({ primType: "boolean" })


function find(t: Type) {
    if (t.union) {
        t.union = find(t.union)
        return t.union
    }
    return t
}

function getFullName(n: py.AST): string {
    let s = n as py.ScopeDef
    let pref = ""
    if (s.parent) {
        pref = getFullName(s.parent)
        if (!pref) pref = ""
        else pref += "."
    }
    let nn = n as py.FunctionDef
    if (nn.name) return pref + nn.name
    else return pref + "?" + n.kind
}

function applyTypeMap(s: string) {
    return U.lookup(typeMap, s) || s
}

function t2s(t: Type): string {
    t = find(t)
    if (t.primType)
        return t.primType
    else if (t.classType)
        return applyTypeMap(getFullName(t.classType))
    else if (t.arrayType)
        return t2s(t.arrayType) + "[]"
    else
        return "?" + t.tid
}

let currErrs = ""

function error(t0: Type, t1: Type) {
    currErrs += "types not compatible: " + t2s(t0) + " and " + t2s(t1) + "; "
}

function typeCtor(t: Type): any {
    if (t.primType) return t.primType
    else if (t.classType) return t.classType
    else if (t.arrayType) return "array"
    return null
}

function canUnify(t0: Type, t1: Type): boolean {
    t0 = find(t0)
    t1 = find(t1)

    if (t0 === t1)
        return true

    let c0 = typeCtor(t0)
    let c1 = typeCtor(t1)

    if (!c0 || !c1)
        return true
    if (c0 !== c1)
        return false

    if (c0 == "array") {
        return canUnify(t0.arrayType, t1.arrayType)
    }
    return true
}

function unify(t0: Type, t1: Type): void {
    t0 = find(t0)
    t1 = find(t1)
    if (t0 === t1)
        return
    if (!canUnify(t0, t1)) {
        error(t0, t1)
        return
    }
    if (typeCtor(t0) && !typeCtor(t1))
        return unify(t1, t0)
    numUnifies++
    t0.union = t1
    if (t0.arrayType && t1.arrayType)
        unify(t0.arrayType, t1.arrayType)
}

function getClassField(ct: py.ClassDef, n: string) {
    if (!ct.fields)
        ct.fields = {}
    if (!ct.fields[n]) {
        for (let par = ct.baseClass; par; par = par.baseClass) {
            if (par.fields[n])
                return par.fields[n]
        }
        ct.fields[n] = {
            name: n,
            type: mkType()
        }
    }
    return ct.fields[n]
}

function getTypeField(t: Type, n: string) {
    t = find(t)
    let ct = t.classType
    if (ct)
        return getClassField(ct, n)
    return null
}

function lookupVar(n: string) {
    let s = currentScope()
    while (s) {
        let v = U.lookup(s.vars, n)
        if (v) return v
        // go to parent, excluding class scopes
        do {
            s = s.parent
        } while (s && s.kind == "ClassDef")
    }
    return null
}

function getClassDef(e: py.Expr) {
    let n = getName(e)
    let v = lookupVar(n)
    if (v)
        return v.classdef
    let s = lookupSymbol(n)
    if (s && s.kind == "ClassDef")
        return s as py.ClassDef
    return null
}

function typeOf(e: py.Expr): Type {
    if (e.tsType) {
        return find(e.tsType)
    } else {
        e.tsType = mkType()
        return e.tsType
    }
}

function isOfType(e: py.Expr, name: string) {
    let t = typeOf(e)
    if (t.classType && t.classType.name == name)
        return true
    if (t2s(t) == name)
        return true
    return false
}

function resetCtx(m: py.Module) {
    ctx = {
        currClass: null,
        currFun: null,
        currModule: m
    }
}

function scope(f: () => B.JsNode) {
    let prevCtx = U.flatClone(ctx)
    let r = f()
    ctx = prevCtx
    return r
}

function todoExpr(name: string, e: B.JsNode) {
    if (!e)
        return B.mkText("")
    return B.mkGroup([B.mkText("/* TODO: " + name + " "), e, B.mkText(" */")])
}

function todoComment(name: string, n: B.JsNode[]) {
    if (n.length == 0)
        return B.mkText("")
    return B.mkGroup([B.mkText("/* TODO: " + name + " "), B.mkGroup(n), B.mkText(" */"), B.mkNewLine()])
}

function doKeyword(k: py.Keyword) {
    let t = expr(k.value)
    if (k.arg)
        return B.mkInfix(B.mkText(k.arg), "=", t)
    else
        return B.mkGroup([B.mkText("**"), t])
}

function doArgs(args: py.Arguments, isMethod: boolean) {
    U.assert(!args.kwonlyargs.length)
    let nargs = args.args.slice()
    if (isMethod) {
        U.assert(nargs[0].arg == "self")
        nargs.shift()
    } else {
        U.assert(!nargs[0] || nargs[0].arg != "self")
    }
    let didx = args.defaults.length - nargs.length
    let lst = nargs.map(a => {
        let v = defvar(a.arg, { isParam: true })
        if (!a.type) a.type = v.type
        let res = [quote(a.arg), typeAnnot(v.type)]
        if (a.annotation)
            res.push(todoExpr("annotation", expr(a.annotation)))
        if (didx >= 0) {
            res.push(B.mkText(" = "))
            res.push(expr(args.defaults[didx]))
            unify(a.type, typeOf(args.defaults[didx]))
        }
        didx++
        return B.mkGroup(res)
    })

    if (args.vararg)
        lst.push(B.mkText("TODO *" + args.vararg.arg))
    if (args.kwarg)
        lst.push(B.mkText("TODO **" + args.kwarg.arg))

    return B.H.mkParenthesizedExpression(B.mkCommaSep(lst))
}

const numOps: Map<number> = {
    Sub: 1,
    Div: 1,
    Pow: 1,
    LShift: 1,
    RShift: 1,
    BitOr: 1,
    BitXor: 1,
    BitAnd: 1,
    FloorDiv: 1,
    Mult: 1, // this can be also used on strings and arrays, but let's ignore that for now
}

const opMapping: Map<string> = {
    Add: "+",
    Sub: "-",
    Mult: "*",
    MatMult: "Math.matrixMult",
    Div: "/",
    Mod: "%",
    Pow: "**",
    LShift: "<<",
    RShift: ">>",
    BitOr: "|",
    BitXor: "^",
    BitAnd: "&",
    FloorDiv: "Math.idiv",

    And: "&&",
    Or: "||",

    Eq: "==",
    NotEq: "!=",
    Lt: "<",
    LtE: "<=",
    Gt: ">",
    GtE: ">=",

    Is: "===",
    IsNot: "!==",
    In: "py.In",
    NotIn: "py.NotIn",
}

const prefixOps: Map<string> = {
    Invert: "~",
    Not: "!",
    UAdd: "P+",
    USub: "P-",
}

const typeMap: pxt.Map<string> = {
    "adafruit_bus_device.i2c_device.I2CDevice": "pins.I2CDevice"
}

function stmts(ss: py.Stmt[]) {
    return B.mkBlock(ss.map(stmt))
}

function exprs0(ee: py.Expr[]) {
    ee = ee.filter(e => !!e)
    return ee.map(expr)
}

function setupScope(n: py.ScopeDef) {
    if (!n.vars) {
        n.vars = {}
        n.parent = currentScope()
    }
}

function typeAnnot(t: Type) {
    let s = t2s(t)
    if (s[0] == "?")
        return B.mkText("")
    return B.mkText(": " + t2s(t))
}


const stmtMap: Map<(v: py.Stmt) => B.JsNode> = {
    FunctionDef: (n: py.FunctionDef) => scope(() => {
        let isMethod = !!ctx.currClass && !ctx.currFun
        if (!isMethod)
            defvar(n.name, { fundef: n })

        setupScope(n)
        ctx.currFun = n
        if (!n.retType) n.retType = mkType()
        let prefix = ""
        let funname = n.name
        let decs = n.decorator_list.filter(d => {
            if (getName(d) == "property") {
                prefix = "get"
                return false
            }
            if (d.kind == "Attribute" && (d as py.Attribute).attr == "setter" &&
                (d as py.Attribute).value.kind == "Name") {
                funname = ((d as py.Attribute).value as py.Name).id
                prefix = "set"
                return false
            }
            return true
        })
        let nodes = [
            todoComment("decorators", decs.map(expr))
        ]
        if (isMethod) {
            if (n.name == "__init__") {
                nodes.push(B.mkText("constructor"))
                unify(n.retType, mkType({ classType: ctx.currClass }))
            } else {
                if (!prefix) {
                    prefix = n.name[0] == "_" ? "private" : "public"
                }
                nodes.push(B.mkText(prefix + " "), quote(funname))
            }
            let fd = getClassField(ctx.currClass, funname)
            fd.fundef = n
        } else {
            U.assert(!prefix)
            if (n.name[0] == "_")
                nodes.push(B.mkText("function "), quote(funname))
            else
                nodes.push(B.mkText("export function "), quote(funname))
        }
        nodes.push(
            doArgs(n.args, isMethod),
            n.name == "__init__" ? B.mkText("") : typeAnnot(n.retType),
            todoComment("returns", n.returns ? [expr(n.returns)] : []),
            stmts(n.body)
        )
        return B.mkStmt(B.mkGroup(nodes))
    }),

    ClassDef: (n: py.ClassDef) => scope(() => {
        setupScope(n)
        defvar(n.name, { classdef: n })
        U.assert(!ctx.currClass)
        ctx.currClass = n
        let nodes = [
            todoComment("keywords", n.keywords.map(doKeyword)),
            todoComment("decorators", n.decorator_list.map(expr)),
            B.mkText("export class "),
            quote(n.name)
        ]
        if (n.bases.length > 0) {
            nodes.push(B.mkText(" extends "))
            nodes.push(B.mkCommaSep(n.bases.map(expr)))
            let b = getClassDef(n.bases[0])
            if (b)
                n.baseClass = b
        }
        let body = stmts(n.body)
        nodes.push(body)

        let fieldDefs = U.values(n.fields)
            .filter(f => !f.fundef && !f.isStatic)
            .map((f) => B.mkStmt(quote(f.name), typeAnnot(f.type)))
        body.children = fieldDefs.concat(body.children)

        return B.mkStmt(B.mkGroup(nodes))
    }),

    Return: (n: py.Return) => {
        if (n.value) {
            let f = ctx.currFun
            if (f) unify(f.retType, typeOf(n.value))
            return B.mkStmt(B.mkText("return "), expr(n.value))
        } else {
            return B.mkStmt(B.mkText("return"))

        }
    },
    AugAssign: (n: py.AugAssign) => {
        let op = opMapping[n.op]
        if (op.length > 3)
            return B.mkStmt(B.mkInfix(
                expr(n.target),
                "=",
                B.H.mkCall(op, [expr(n.target), expr(n.value)])
            ))
        else
            return B.mkStmt(
                expr(n.target),
                B.mkText(" " + op + "= "),
                expr(n.value)
            )
    },
    Assign: (n: py.Assign) => {
        if (n.targets.length != 1)
            return stmtTODO(n)
        let pref = ""
        let isConstCall = isCallTo(n.value, "const")
        let nm = getName(n.targets[0]) || ""
        let isUpperCase = nm && !/[a-z]/.test(nm)
        if (!ctx.currClass && !ctx.currFun && nm[0] != "_")
            pref = "export "
        if (nm && ctx.currClass && !ctx.currFun) {
            let fd = getClassField(ctx.currClass, nm)
            unify(fd.type, typeOf(n.targets[0]))
            fd.isStatic = true
            pref = "static "
        }
        unify(typeOf(n.targets[0]), typeOf(n.value))
        if (isConstCall || isUpperCase) {
            // first run would have "let" in it
            defvar(getName(n.targets[0]), {})
            return B.mkStmt(B.mkText(pref + "const "), B.mkInfix(expr(n.targets[0]), "=", expr(n.value)))
        }
        if (!pref && n.targets[0].kind == "Tuple") {
            let res = [
                B.mkStmt(B.mkText("const tmp = "), expr(n.value))
            ]
            let tup = n.targets[0] as py.Tuple
            tup.elts.forEach((e, i) => {
                res.push(
                    B.mkStmt(B.mkInfix(expr(e), "=", B.mkText("tmp[" + i + "]")))
                )
            })
            return B.mkGroup(res)
        }
        return B.mkStmt(B.mkText(pref), B.mkInfix(expr(n.targets[0]), "=", expr(n.value)))
    },
    For: (n: py.For) => {
        U.assert(n.orelse.length == 0)
        if (isCallTo(n.iter, "range")) {
            let r = n.iter as py.Call
            let def = expr(n.target)
            let ref = quote(getName(n.target))
            unify(typeOf(n.target), tpNumber)
            let start = r.args.length == 1 ? B.mkText("0") : expr(r.args[0])
            let stop = expr(r.args[r.args.length == 1 ? 0 : 1])
            return B.mkStmt(
                B.mkText("for ("),
                B.mkInfix(def, "=", start),
                B.mkText("; "),
                B.mkInfix(ref, "<", stop),
                B.mkText("; "),
                r.args.length >= 3 ?
                    B.mkInfix(ref, "+=", expr(r.args[2])) :
                    B.mkInfix(null, "++", ref),
                B.mkText(")"),
                stmts(n.body))
        }
        unify(typeOf(n.iter), mkType({ arrayType: typeOf(n.target) }))
        return B.mkStmt(
            B.mkText("for ("),
            expr(n.target),
            B.mkText(" of "),
            expr(n.iter),
            B.mkText(")"),
            stmts(n.body))
    },
    While: (n: py.While) => {
        U.assert(n.orelse.length == 0)
        return B.mkStmt(
            B.mkText("while ("),
            expr(n.test),
            B.mkText(")"),
            stmts(n.body))
    },
    If: (n: py.If) => {
        let innerIf = (n: py.If) => {
            let nodes = [
                B.mkText("if ("),
                expr(n.test),
                B.mkText(")"),
                stmts(n.body)
            ]
            if (n.orelse.length) {
                nodes[nodes.length - 1].noFinalNewline = true
                if (n.orelse.length == 1 && n.orelse[0].kind == "If") {
                    // else if
                    nodes.push(B.mkText(" else "))
                    U.pushRange(nodes, innerIf(n.orelse[0] as py.If))
                } else {
                    nodes.push(B.mkText(" else"), stmts(n.orelse))
                }
            }
            return nodes
        }
        return B.mkStmt(B.mkGroup(innerIf(n)))
    },
    With: (n: py.With) => {
        if (n.items.length == 1 && isOfType(n.items[0].context_expr, "pins.I2CDevice")) {
            let it = n.items[0]
            let id = getName(it.optional_vars)
            let res: B.JsNode[] = []
            let devRef = expr(it.context_expr)
            if (id) {
                defvar(id, { isLocal: true })
                id = quoteStr(id)
                res.push(B.mkStmt(B.mkText("const " + id + " = "), devRef))
                devRef = B.mkText(id)
            }
            res.push(B.mkStmt(B.mkInfix(devRef, ".", B.mkText("begin()"))))
            U.pushRange(res, n.body.map(stmt))
            res.push(B.mkStmt(B.mkInfix(devRef, ".", B.mkText("end()"))))
            return B.mkGroup(res)
        }

        let cleanup: B.JsNode[] = []
        let stmts = n.items.map((it, idx) => {
            let varName = "with" + idx
            if (it.optional_vars) {
                let id = getName(it.optional_vars)
                U.assert(id != null)
                defvar(id, { isLocal: true })
                varName = quoteStr(id)
            }
            cleanup.push(B.mkStmt(B.mkText(varName + ".end()")))
            return B.mkStmt(B.mkText("const " + varName + " = "),
                B.mkInfix(expr(it.context_expr), ".", B.mkText("begin()")))
        })
        U.pushRange(stmts, n.body.map(stmt))
        U.pushRange(stmts, cleanup)
        return B.mkBlock(stmts)
    },
    Raise: (n: py.Raise) => {
        let ex = n.exc || n.cause
        if (!ex)
            return B.mkStmt(B.mkText("throw"))
        let msg: B.JsNode
        if (ex && ex.kind == "Call") {
            let cex = ex as py.Call
            if (cex.args.length == 1) {
                msg = expr(cex.args[0])
            }
        }
        // didn't find string - just compile and quote; and hope for the best
        if (!msg)
            msg = B.mkGroup([B.mkText("`"), expr(ex), B.mkText("`")])
        return B.mkStmt(B.H.mkCall("control.fail", [msg]))
    },
    Assert: (n: py.Assert) => B.mkStmt(B.H.mkCall("control.assert", exprs0([n.test, n.msg]))),
    Import: (n: py.Import) => {
        for (let nm of n.names) {
            if (nm.asname)
                defvar(nm.asname, {
                    expandsTo: nm.name
                })
            defvar(nm.name, {
                isPlainImport: true
            })
        }
        return B.mkText("")
    },
    ImportFrom: (n: py.ImportFrom) => {
        for (let nn of n.names) {
            if (nn.name == "*")
                defvar(n.module, {
                    isImportStar: true
                })
            else
                defvar(nn.asname || nn.name, {
                    expandsTo: n.module + "." + nn.name
                })
        }
        return B.mkText("")
    },
    ExprStmt: (n: py.ExprStmt) =>
        n.value.kind == "Str" ?
            docComment((n.value as py.Str).s) :
            B.mkStmt(expr(n.value)),
    Pass: (n: py.Pass) => B.mkStmt(B.mkText(";")),
    Break: (n: py.Break) => B.mkStmt(B.mkText("break")),
    Continue: (n: py.Continue) => B.mkStmt(B.mkText("break")),

    Delete: (n: py.Delete) => stmtTODO(n),
    Try: (n: py.Try) => {
        let r = [
            B.mkText("try"),
            stmts(n.body.concat(n.orelse)),
        ]
        for (let e of n.handlers) {
            r.push(B.mkText("catch ("), e.name ? quote(e.name) : B.mkText("_"))
            // This isn't JS syntax, but PXT doesn't support try at all anyway
            if (e.type)
                r.push(B.mkText("/* instanceof "), expr(e.type), B.mkText(" */"))
            r.push(B.mkText(")"), stmts(e.body))
        }
        if (n.finalbody.length)
            r.push(B.mkText("finally"), stmts(n.finalbody))
        return B.mkStmt(B.mkGroup(r))
    },
    AnnAssign: (n: py.AnnAssign) => stmtTODO(n),
    AsyncFunctionDef: (n: py.AsyncFunctionDef) => stmtTODO(n),
    AsyncFor: (n: py.AsyncFor) => stmtTODO(n),
    AsyncWith: (n: py.AsyncWith) => stmtTODO(n),
    Global: (n: py.Global) =>
        B.mkStmt(B.mkText("TODO: global: "), B.mkGroup(n.names.map(B.mkText))),
    Nonlocal: (n: py.Nonlocal) =>
        B.mkStmt(B.mkText("TODO: nonlocal: "), B.mkGroup(n.names.map(B.mkText))),
}

function possibleDef(n: py.Name) {
    let id = n.id
    if (n.isdef === undefined) {
        let curr = lookupVar(id)
        if (!curr) {
            if (ctx.currClass && !ctx.currFun) {
                n.isdef = false // field
                curr = defvar(id, {})
            } else {
                n.isdef = true
                curr = defvar(id, { isLocal: true })
            }
        } else {
            n.isdef = false
        }
        unify(n.tsType, curr.type)
    }

    if (n.isdef)
        return B.mkGroup([B.mkText("let "), quote(id)])
    else
        return quote(id)
}

function quoteStr(id: string) {
    if (B.isReservedWord(id))
        return id + "_"
    else if (!id)
        return id
    else
        return id
    //return id.replace(/([a-z0-9])_([a-zA-Z0-9])/g, (f: string, x: string, y: string) => x + y.toUpperCase())
}

function getName(e: py.Expr): string {
    if (e.kind == "Name") {
        let s = (e as py.Name).id
        let v = lookupVar(s)
        if (v && v.expandsTo) return v.expandsTo
        else return s
    }
    if (e.kind == "Attribute") {
        let pref = getName((e as py.Attribute).value)
        if (pref)
            return pref + "." + (e as py.Attribute).attr
    }
    return null
}

function quote(id: py.identifier) {
    if (id == "self")
        return B.mkText("this")
    return B.mkText(quoteStr(id))
}

function isCallTo(n: py.Expr, fn: string) {
    if (n.kind != "Call")
        return false
    let c = n as py.Call
    return getName(c.func) == fn
}

function binop(left: B.JsNode, pyName: string, right: B.JsNode) {
    let op = opMapping[pyName]
    U.assert(!!op)
    if (op.length > 3)
        return B.H.mkCall(op, [left, right])
    else
        return B.mkInfix(left, op, right)
}

// TODO include return type
let funMap: Map<string> = {
    "const": "",
    "micropython.const": "",
    "int": "Math.trunc",
    "len": ".length",
    "min": "Math.min",
    "max": "Math.max",
    "string.lower": ".toLowerCase()",
    "ord": ".charCodeAt(0)",
    "bytearray": "pins.createBuffer",
}

const exprMap: Map<(v: py.Expr) => B.JsNode> = {
    BoolOp: (n: py.BoolOp) => {
        let r = expr(n.values[0])
        for (let i = 1; i < n.values.length; ++i) {
            r = binop(r, n.op, expr(n.values[i]))
        }
        return r
    },
    BinOp: (n: py.BinOp) => {
        let r = binop(expr(n.left), n.op, expr(n.right))
        if (numOps[n.op]) {
            unify(typeOf(n.left), tpNumber)
            unify(typeOf(n.right), tpNumber)
            unify(n.tsType, tpNumber)
        }
        return r
    },
    UnaryOp: (n: py.UnaryOp) => {
        let op = prefixOps[n.op]
        U.assert(!!op)
        return B.mkInfix(null, op, expr(n.operand))
    },
    Lambda: (n: py.Lambda) => exprTODO(n),
    IfExp: (n: py.IfExp) =>
        B.mkInfix(B.mkInfix(expr(n.test), "?", expr(n.body)), ":", expr(n.orelse)),
    Dict: (n: py.Dict) => exprTODO(n),
    Set: (n: py.Set) => exprTODO(n),
    ListComp: (n: py.ListComp) => exprTODO(n),
    SetComp: (n: py.SetComp) => exprTODO(n),
    DictComp: (n: py.DictComp) => exprTODO(n),
    GeneratorExp: (n: py.GeneratorExp) => exprTODO(n),
    Await: (n: py.Await) => exprTODO(n),
    Yield: (n: py.Yield) => exprTODO(n),
    YieldFrom: (n: py.YieldFrom) => exprTODO(n),
    Compare: (n: py.Compare) => {
        if (n.ops.length == 1 && (n.ops[0] == "In" || n.ops[0] == "NotIn")) {
            if (find(typeOf(n.comparators[0])) == tpString)
                unify(typeOf(n.left), tpString)
            let idx = B.mkInfix(expr(n.comparators[0]), ".", B.H.mkCall("indexOf", [expr(n.left)]))
            return B.mkInfix(idx, n.ops[0] == "In" ? ">=" : "<", B.mkText("0"))
        }
        let r = binop(expr(n.left), n.ops[0], expr(n.comparators[0]))
        for (let i = 1; i < n.ops.length; ++i) {
            r = binop(r, "And", binop(expr(n.comparators[i - 1]), n.ops[i], expr(n.comparators[i])))
        }
        return r
    },
    Call: (n: py.Call) => {
        let cd = getClassDef(n.func)
        let recvTp: Type
        let recv: py.Expr
        let methName: string
        let fd: py.FunctionDef

        if (cd) {
            if (cd.fields) {
                let ff = cd.fields["__init__"]
                if (ff)
                    fd = ff.fundef
            }
        } else {
            if (n.func.kind == "Attribute") {
                let attr = n.func as py.Attribute
                recv = attr.value
                recvTp = typeOf(recv)
                methName = attr.attr
                let field = getTypeField(recvTp, methName)
                if (field && field.fundef)
                    fd = field.fundef
            }
            if (!fd) {
                let name = getName(n.func)
                let v = lookupVar(name)
                if (v)
                    fd = v.fundef
            }
        }

        let allargs: B.JsNode[] = []
        let fdargs = fd ? fd.args.args : []
        if (fdargs[0] && fdargs[0].arg == "self")
            fdargs = fdargs.slice(1)
        for (let i = 0; i < n.args.length; ++i) {
            let e = n.args[i]
            allargs.push(expr(e))
            if (fdargs[i] && fdargs[i].type) {
                unify(typeOf(e), fdargs[i].type)
            }
        }

        if (fd) {
            unify(typeOf(n), fd.retType)
        }

        // TODO keywords

        let nm = getName(n.func)

        if (methName)
            nm = t2s(recvTp) + "." + methName

        let over = U.lookup(funMap, nm)

        if (n.keywords.length > 0) {
            if (fd) {
                let formals = fdargs.slice(n.args.length)
                let defls = fd.args.defaults.slice()
                while (formals.length > 0) {
                    let last = formals[formals.length - 1]
                    if (n.keywords.some(k => k.arg == last.arg))
                        break
                    formals.pop()
                    defls.pop()
                }
                while (defls.length > formals.length)
                    defls.shift()
                while (defls.length < formals.length)
                    defls.unshift(null)

                let actual = U.toDictionary(n.keywords, k => k.arg)
                let idx = 0
                for (let formal of formals) {
                    let ex = U.lookup(actual, formal.arg)
                    if (ex)
                        allargs.push(expr(ex.value))
                    else {
                        allargs.push(expr(defls[idx]))
                    }
                    idx++
                }
            } else {
                let kwargs = n.keywords.map(kk => B.mkGroup([quote(kk.arg), B.mkText(": "), expr(kk.value)]))
                allargs.push(B.mkGroup([
                    B.mkText("{"),
                    B.mkCommaSep(kwargs),
                    B.mkText("}")
                ]))
            }
        }

        if (nm == "super" && allargs.length == 0) {
            if (ctx.currClass && ctx.currClass.baseClass)
                unify(n.tsType, mkType({ classType: ctx.currClass.baseClass }))
            return B.mkText("super")
        }

        if (over != null) {
            if (recv)
                allargs.unshift(expr(recv))
            if (over == "") {
                if (allargs.length == 1)
                    return allargs[0]
            } else if (over[0] == ".") {
                if (allargs.length == 1)
                    return B.mkInfix(allargs[0], ".", B.mkText(over.slice(1)))
                else
                    return B.mkInfix(allargs[0], ".", B.H.mkCall(over.slice(1), allargs.slice(1)))
            } else {
                return B.H.mkCall(over, allargs)
            }
        }

        let fn = expr(n.func)

        if (recvTp && recvTp.arrayType) {
            if (methName == "append") {
                methName = "push"
                unify(typeOf(n.args[0]), recvTp.arrayType)
            }
            fn = B.mkInfix(expr(recv), ".", B.mkText(methName))
        }

        let nodes = [
            fn,
            B.mkText("("),
            B.mkCommaSep(allargs),
            B.mkText(")")
        ]

        if (cd) {
            nodes[0] = B.mkText(applyTypeMap(getFullName(cd)))
            nodes.unshift(B.mkText("new "))
        }

        return B.mkGroup(nodes)
    },
    Num: (n: py.Num) => {
        unify(n.tsType, tpNumber)
        return B.mkText(n.n + "")
    },
    Str: (n: py.Str) => {
        unify(n.tsType, tpString)
        return B.mkText(B.stringLit(n.s))
    },
    FormattedValue: (n: py.FormattedValue) => exprTODO(n),
    JoinedStr: (n: py.JoinedStr) => exprTODO(n),
    Bytes: (n: py.Bytes) => {
        let hex = B.stringLit(U.toHex(new Uint8Array(n.s)))
        return B.H.mkCall("pins.createBufferFromHex", [B.mkText(hex)])
    },
    NameConstant: (n: py.NameConstant) => {
        if (n.value != null)
            unify(n.tsType, tpBoolean)
        return B.mkText(JSON.stringify(n.value))
    },
    Ellipsis: (n: py.Ellipsis) => exprTODO(n),
    Constant: (n: py.Constant) => exprTODO(n),
    Attribute: (n: py.Attribute) => {
        let part = typeOf(n.value)
        let fd = getTypeField(part, n.attr)
        if (fd) unify(n.tsType, fd.type)
        return B.mkInfix(expr(n.value), ".", B.mkText(quoteStr(n.attr)))
    },
    Subscript: (n: py.Subscript) => {
        if (n.slice.kind == "Index")
            return B.mkGroup([
                expr(n.value),
                B.mkText("["),
                expr((n.slice as py.Index).value),
                B.mkText("]"),
            ])
        else if (n.slice.kind == "Slice") {
            let s = n.slice as py.Slice
            return B.mkInfix(expr(n.value), ".",
                B.H.mkCall("slice", [s.lower ? expr(s.lower) : B.mkText("0"),
                    s.upper ? expr(s.upper) : null].filter(x => !!x)))
        }
        else {
            return exprTODO(n)
        }
    },
    Starred: (n: py.Starred) => B.mkGroup([B.mkText("... "), expr(n.value)]),
    Name: (n: py.Name) => {
        if (n.id == "self" && ctx.currClass) {
            unify(n.tsType, mkType({ classType: ctx.currClass }))
        } else {
            let v = lookupVar(n.id)
            if (v)
                unify(n.tsType, v.type)
        }

        if (n.ctx.indexOf("Load") >= 0) {
            let nm = getName(n)
            return quote(nm)
        } else
            return possibleDef(n)
    },
    List: mkArrayExpr,
    Tuple: mkArrayExpr,
}

function mkArrayExpr(n: py.List | py.Tuple) {
    unify(n.tsType, mkType({ arrayType: n.elts[0] ? typeOf(n.elts[0]) : mkType() }))
    return B.mkGroup([
        B.mkText("["),
        B.mkCommaSep(n.elts.map(expr)),
        B.mkText("]"),
    ])
}

function expr(e: py.Expr): B.JsNode {
    let f = exprMap[e.kind]
    if (!f) {
        U.oops(e.kind + " - unknown expr")
    }
    typeOf(e)
    return f(e)
}

function stmt(e: py.Stmt): B.JsNode {
    let f = stmtMap[e.kind]
    if (!f) {
        U.oops(e.kind + " - unknown stmt")
    }
    let r = f(e)
    if (currErrs) {
        r = B.mkGroup([B.H.mkComment("TODO: (below) " + currErrs), r])
        currErrs = ""
    }
    return r
}

// TODO based on lineno/col_offset mark which numbers are written in hex
// TODO look at scopes of let
// TODO fetch comments

function toTS(mod: py.Module) {
    U.assert(mod.kind == "Module")
    resetCtx(mod)
    if (!mod.vars) mod.vars = {}
    return [
        B.mkText("namespace " + mod.name + " "),
        B.mkBlock(mod.body.map(stmt))
    ]
}

export function convertAsync(fns: string[]) {
    let primFiles = U.toDictionary(nodeutil.allFiles(fns[0]), s => s)
    let files = U.concat(fns.map(f => nodeutil.allFiles(f))).map(f => f.replace(/\\/g, "/"))
    let dirs: Map<number> = {}
    for (let f of files) {
        for (let suff of ["/docs/conf.py", "/conf.py", "/setup.py", "/README.md", "/README.rst"]) {
            if (U.endsWith(f, suff)) {
                dirs[f.slice(0, f.length - suff.length)] = 1
            }
        }
    }
    let pkgFiles: Map<string> = {}
    for (let f of files) {
        if (U.endsWith(f, ".py") && !U.endsWith(f, "/setup.py") && !U.endsWith(f, "/conf.py")) {
            let par = f
            while (par) {
                if (dirs[par]) {
                    let modName = f.slice(par.length + 1).replace(/\.py$/, "").replace(/\//g, ".")
                    if (!U.startsWith(modName, "examples."))
                        pkgFiles[f] = modName
                    break
                }
                par = par.replace(/\/?[^\/]*$/, "")
            }
        }
    }

    return nodeutil.spawnWithPipeAsync({
        cmd: "python3",
        args: [],
        input: convPy.replace("@files@", JSON.stringify(Object.keys(pkgFiles))),
        silent: true
    })
        .then(buf => {
            let js = JSON.parse(buf.toString("utf8"))
            let rec = (v: any): any => {
                if (Array.isArray(v)) {
                    for (let i = 0; i < v.length; ++i)
                        v[i] = rec(v[i])
                    return v
                }
                if (!v || !v.kind)
                    return v
                v.kind = U.lookup(nameMap, v.kind) || v.kind
                if (U.lookup(simpleNames, v.kind))
                    return v.kind
                for (let k of Object.keys(v)) {
                    v[k] = rec(v[k])
                }
                return v
            }
            js.kind = "FileSet"
            js = rec(js)
            delete js.kind

            moduleAst = {}
            U.iterMap(js, (fn: string, js: py.Module) => {
                let mname = pkgFiles[fn]
                js.name = mname
                moduleAst[mname] = js
            })

            for (let i = 0; i < 5; ++i) {
                U.iterMap(js, (fn: string, js: any) => {
                    toTS(js)
                })
            }

            let files: pxt.Map<string> = {}

            U.iterMap(js, (fn: string, js: py.Module) => {
                if (primFiles[fn]) {
                    let s = "//\n// *** " + fn + " ***\n//\n\n"
                    let nodes = toTS(js)
                    let res = B.flattenNode(nodes)
                    s += res.output
                    let fn2 = js.name + ".ts"
                    files[fn2] = (files[fn2] || "") + s
                }
            })

            U.iterMap(files, (fn, s) => {
                console.log("*** write " + fn)
                fs.writeFileSync(fn, s)
            })
        })
}
