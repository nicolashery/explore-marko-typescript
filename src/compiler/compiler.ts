import * as markoCompiler from "marko/dist/compiler";
import * as ts from "typescript";

const isArray = Array.isArray;

function toStatement(node: any) {
  if (
    ts.isCallExpression(node) ||
    ts.isBinaryExpression(node)
  ) {
    // TODO: catch other non-statements
    // Is there a better way to do this?
    // Would be good to have `!ts.isStatement(node)`
    return ts.createStatement(node);
  }

  return node;
}

// `Template` is actually specific to a single template file since it uses the type
// declarations of `Input` located in that template file, to make sure we don't pass
// the wrong data to the `Template.render()` methods
const templateInterfaceSource = `interface Template {
  render(input: Input, cb: (err: any, out: any) => void): void;
  render(input: Input, stream: any): void;
  renderToString(input: Input): string;
  _: any;
  meta: any;
}`;
const templateInterfaceCode = ts.createSourceFile(
  "TemplateInterface.ts",
  templateInterfaceSource,
  ts.ScriptTarget.Latest,
  false,
  ts.ScriptKind.TS
);

function tsTransform(node: any, context: any): any {
  if (!node) {
    return;
  }

  if (isArray(node) && node.length) {
    return node.reduce((acc: any, n: any) => {
      let code = tsTransform(n, context);
      if (!code) {
        return acc;
      }
      if (isArray(code)) {
        code = code.filter((c) => !!c);
        return acc.concat(code);
      }
      acc.push(code);
      return acc;
    }, []);
  }

  if (node.type === "Program") {
    let statements = tsTransform(node.body, context)
      .map(toStatement);
    // A bit of a hack, is there a better way to create a top-level node?
    const program = ts.createSourceFile("Program.ts", "", ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    statements = templateInterfaceCode.statements.concat(statements);
    program.statements = statements;

    return program;
  }

  if (node.type === "FunctionDeclaration") {
    const parameters = node.params.map((p: any) => {
      if (p.type !== "Identifier") {
        throw new Error("No support for param.type " + p.type);
      }
      const name = ts.createIdentifier(p.name);
      const type = (node.name === "render" && p.name === "input")
        ? ts.createLiteralTypeNode(ts.createIdentifier("Input"))
        : ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
      return ts.createParameter(undefined, undefined, undefined, name, undefined, type);
    });
    const statements = tsTransform(node.body, context)
      .map(toStatement);

    return ts.createFunctionDeclaration(
        undefined,
        undefined,
        undefined,
        ts.createIdentifier(node.name),
        undefined,
        parameters,
        ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        ts.createBlock(statements, true)
    );
  }

  if (node.type === "If") {
    const expression = tsTransform(node.test, context);
    const thenStatement = ts.createBlock(tsTransform(node.body, context).map(toStatement), true);
    const elseStatement = node.else
      ? ts.createBlock(tsTransform(node.else, context).map(toStatement), true)
      : undefined;

    return ts.createIf(
      expression,
      thenStatement,
      elseStatement
    );
  }

  if (node.type === "MemberExpression") {
    const expression = tsTransform(node.object, context);
    const name = tsTransform(node.property, context);

    return ts.createPropertyAccess(
      expression,
      name
    );
  }

  if (node.type === "Identifier") {
    return ts.createIdentifier(node.name);
  }

  if (node.type === "Literal") {
    if (typeof node.value === "object" && JSON.stringify(node.value) === "{}") {
      return ts.createObjectLiteral();
    }
    return ts.createLiteral(node.value);
  }

  if (node.type === "Html") {
    let argument: ts.Expression;
    if (node.argument.length > 1) {
      argument = node.argument.slice(1).reduce((sum: ts.BinaryExpression, arg: any) => {
        return ts.createAdd(sum, tsTransform(arg, context));
      }, tsTransform(node.argument[0], context));
    } else {
      argument = tsTransform(node.argument[0], context);
    }

    return ts.createCall(
      ts.createPropertyAccess(ts.createIdentifier("out"), ts.createIdentifier("w")),
      undefined,
      [argument]
    );
  }

  if (node.type === "FunctionCall") {
    return ts.createCall(
      tsTransform(node.callee, context),
      undefined,
      tsTransform(node.args, context)
    );
  }

  if (node.type === "Vars") {
    // Special case for single-line require statements
    // (ex: `var marko_runtime = require("marko/dist/html");`)
    // Switch to import statement
    if (
      node.declarations.length === 1 &&
      node.declarations[0].type === "VariableDeclarator" &&
      node.declarations[0].id.type === "Identifier" &&
      node.declarations[0].init.type === "FunctionCall" &&
      node.declarations[0].init.callee.type === "Identifier" &&
      node.declarations[0].init.callee.name === "require" &&
      node.declarations[0].init.args.length === 1 &&
      node.declarations[0].init.args[0].type === "Literal"
    ) {
      return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(undefined, ts.createNamespaceImport(ts.createIdentifier(node.declarations[0].id.name))),
        ts.createLiteral(node.declarations[0].init.args[0].value)
      );
    }

    return ts.createVariableStatement(undefined, tsTransform(node.declarations, context));
  }

  if (node.type === "VariableDeclarator") {
    let typeNode: ts.TypeNode | undefined;
    // Special case for `var marko_template = ...`
    // add type annotation
    if (node.id.type === "Identifier" && node.id.name === "marko_template") {
      typeNode = ts.createLiteralTypeNode(ts.createIdentifier("Template"));
    }

    return ts.createVariableDeclaration(
      tsTransform(node.id, context),
      typeNode,
      tsTransform(node.init, context)
    );
  }

  if (node.type === "Assignment") {
    // Special case of `module.exports = ...;`
    if (
      node.left.type === "MemberExpression" &&
      node.left.object.type === "Identifier" &&
      node.left.object.name === "module" &&
      node.left.property.type === "Identifier" &&
      node.left.property.name === "exports"
    ) {
      return ts.createExportDefault(
        tsTransform(node.right, context)
      );
    }

    return ts.createAssignment(
      tsTransform(node.left, context),
      tsTransform(node.right, context)
    );
  }

  if (node.type === "Scriptlet") {
    const code = ts.createSourceFile("Scriptlet.ts", node.code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    return code.statements;
  }

  if (node.type === "Code") {
    let lines = node.value.split("\n");
    if (!lines.length) {
      return;
    }
    // TODO: Only remove first and last lines, throw an error if not
    // this allows for inline JSDocs etc.
    lines = lines.reduce((acc: Array<string>, l: string) => {
      if (l.indexOf("/**@ts") > -1 || l.indexOf("*/") > -1) {
        return acc;
      }
      acc.push(l);
      return acc;
    }, []);
    const code = ts.createSourceFile("Code.ts", lines.join("\n"), ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    return code.statements;
  }
}

const TYPESCRIPT_CONTEXT_KEY = "tsContext";

function transformMarkoAst(root: any, context: any) {
  const builder = context.builder;
  const tsContext = context[TYPESCRIPT_CONTEXT_KEY] || (context[TYPESCRIPT_CONTEXT_KEY] = {
    extractedRequires: []
  });

  const walker = context.createWalker({
    enter(node: any) {
      if (node.type === "Vars" && node.parentNode === null) {
        // Top-level vars, let's transform them
        const newDeclarations: Array<any> = [];
        node.declarations.forEach((declaration: any) => {
          if (
            declaration.type === "VariableDeclarator" &&
            declaration.id.type === "Identifier" &&
            declaration.id.name === "marko_template"
          ) {
            // Replace `var marko_template = module.exports = require("marko/src/html").t(__filename)`
            // with just `var marko_template = marko_html.t(__filename)`
            // (import will be hoisted to top, exports to the bottom)
            declaration = builder.variableDeclarator(
              "marko_template",
              builder.functionCall(
                builder.memberExpression(builder.identifier("marko_runtime"), builder.identifier("t")),
                [builder.identifier("__filename")]
              )
            );

            tsContext.extractedRequires.push(
              builder.var(
                builder.identifier("marko_runtime"),
                builder.require(
                  builder.literal(context.getModuleRuntimeTarget())
                )
              )
            );

            newDeclarations.push(declaration);
            return;
          }

          if (
            declaration.type === "VariableDeclarator" &&
            declaration.init.type === "FunctionCall" &&
            declaration.init.callee.type === "Identifier" &&
            declaration.init.callee.name === "require"
          ) {
            // Extract require statements like `marko_helpers = require("marko/dist/runtime/html/helpers")`
            tsContext.extractedRequires.push(
              builder.var(
                declaration.id,
                declaration.init
              )
            );
            return;
          }

          newDeclarations.push(declaration);
        });

        node.declarations = newDeclarations;
        return node;
      }
    },

    exit(node: any) {
      if (node.type === "Program") {
        let body: Array<any> = [];

        body = body.concat(tsContext.extractedRequires);

        body = body.concat(node.body);

        body = body.filter((n: any) => {
          if (n.type === "Literal" && n.value === "use strict") {
            return false;
          }

          return true;
        });

        body.push(
          builder.assignment(
            builder.moduleExports(),
            builder.identifier("marko_template")
          )
        );

        node.body = body;

        return node;
      }
    }
  });

  walker.walk(root);
}

export function compileFile(filename: string): string {
  const compiled = markoCompiler.compileFile(filename, {
    sourceOnly: false,
    writeVersionComment: false
  });

  transformMarkoAst(compiled.ast, compiled.context);

  const markoAst = compiled.ast;
  const resultFile = ts.createSourceFile(
    "product.marko.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
  });
  const rootNode = tsTransform(markoAst, {});
  let result = printer.printNode(ts.EmitHint.Unspecified, rootNode, resultFile);

  result = "/* tslint:disable */\n" + result;

  return result;
}
