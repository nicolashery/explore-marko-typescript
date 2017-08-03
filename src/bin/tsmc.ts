import * as compiler from "../compiler/compiler";

const filename = process.argv[2];
if (!filename) {
  throw new Error("Must provide a filename");
}

const result = compiler.compileFile(filename);

/* tslint:disable */
console.log(result);
/* tslint:enable */
