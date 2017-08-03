import { assert } from "chai";
import * as fs from "fs";
import * as path from "path";

import * as compiler from "../src/compiler/compiler";

describe("Compiler", () => {
  describe("compileFile", () => {
    it("should compile a sample Marko file to expected TypeScript file", () => {
      const actual = compiler.compileFile(path.join(__dirname, "fixtures/test.marko.txt"));
      const expected = fs.readFileSync(path.join(__dirname, "fixtures/test.marko.ts.txt"), "utf8");
      assert.equal(actual, expected);
    });
  });
});
