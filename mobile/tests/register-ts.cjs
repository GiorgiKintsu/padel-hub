// Lets the plain Node test runner `require` the app's TypeScript domain modules.
// Each file is transpiled on its own, with no type checking (`npm run typecheck` covers that),
// so tests can only load modules that have no React, React Native or `@/` value imports.
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

Module._extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(outputText, filename);
};
