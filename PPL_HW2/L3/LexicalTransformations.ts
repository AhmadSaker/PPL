import { ClassExp, ProcExp, Exp, Program, makeProcExp, Binding, CExp, makeAppExp, makeBoolExp, makeIfExp, makeLitExp, makeStrExp, makeVarDecl, makeVarRef, isClassExp, makeClassExp, isExp, isProgram, isCExp, isAtomicExp, isLitExp, isIfExp, isDefineExp, DefineExp, makeDefineExp, isProcExp, isLetExp, makeBinding, LetExp, makeLetExp, isAppExp, AppExp, makeProgram, makePrimOp } from "./L3-ast";
import { Result, bind, makeFailure, makeOk, mapResult, mapv } from "../shared/result";
import { reduce } from "ramda";
import { first, second } from "../shared/list";
import { parse } from "path";
import { promises } from "fs";
import { makeEmptySExp, makeSymbolSExp } from "./L3-value";

/*
Purpose: Transform ClassExp to ProcExp
Signature: class2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp => {
    const msgVar = makeVarDecl("msg");
    const methodsReversed = exp.methods.slice().reverse(); 
    const nestedIfExp: CExp = reduce(
        (acc: CExp, b: Binding): CExp =>
            makeIfExp(
                makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makeLitExp(makeSymbolSExp(b.var.var))]),
                makeAppExp(b.val, []),
                acc
            ),
        makeBoolExp(false),
        methodsReversed
    );
    const innerProc = makeProcExp([msgVar], [nestedIfExp]);
    // creating the outer procedure that takes fields as arguments and returns the inner procedure
    return makeProcExp(exp.fields, [innerProc]);
};

/*
Purpose: Transform all class forms in the given AST to procs
Signature: lexTransform(AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

export const lexTransform = (exp: Exp | Program): Result<Exp | Program> =>
    isExp(exp) ? bind(lexTransformExp(exp), makeOk) :
    isProgram(exp) ? lexTransformProgram(exp) :
    makeFailure("Not Recognized");

const lexTransformProgram = (exp: Program): Result<Program> =>
    bind(mapResult(lexTransformExp, exp.exps), exps => makeOk(makeProgram(exps)));

const lexTransformExp = (exp: Exp): Result<Exp> =>
    isDefineExp(exp) ? lexTransformDefineExp(exp) :
    isCExp(exp) ? bind(lexTransformCExp(exp), makeOk) :
    makeFailure("Not Recognized");

const lexTransformDefineExp = (exp: DefineExp): Result<DefineExp> =>
    bind(lexTransformCExp(exp.val), val => makeOk(makeDefineExp(exp.var, val)));

const lexTransformCExp = (exp: CExp): Result<CExp> =>
    isAtomicExp(exp) || isLitExp(exp) ? makeOk(exp) :
    isClassExp(exp) ? makeOk(class2proc(exp)) :
    isIfExp(exp) ? bind(lexTransformCExp(exp.test), test =>
        bind(lexTransformCExp(exp.then), then =>
            bind(lexTransformCExp(exp.alt), alt => makeOk(makeIfExp(test, then, alt))))) :
    isProcExp(exp) ? bind(mapResult(lexTransformCExp, exp.body), body => makeOk(makeProcExp(exp.args, body))) :
    isLetExp(exp) ? bind(mapResult(b => bind(lexTransformCExp(b.val), val => makeOk(makeBinding(b.var.var, val))), exp.bindings),
        bindings => bind(mapResult(lexTransformCExp, exp.body), body => makeOk(makeLetExp(bindings, body)))) :
    isAppExp(exp) ? bind(lexTransformCExp(exp.rator), rator =>
        bind(mapResult(lexTransformCExp, exp.rands), rands => makeOk(makeAppExp(rator, rands)))) :
    makeFailure("Not Recognized");
