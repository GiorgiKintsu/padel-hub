// Source files import siblings as "./x.js" (Node ESM style). Jest must find "./x.ts" for those,
// but only for our own files: requests that originate inside node_modules are left alone.
module.exports = (request, options) => {
  const fromOwnCode = !options.basedir.includes('node_modules');
  if (fromOwnCode && /^\.{1,2}\//.test(request) && request.endsWith('.js')) {
    try {
      return options.defaultResolver(request.slice(0, -3), options);
    } catch {
      /* fall through to the normal resolution */
    }
  }
  return options.defaultResolver(request, options);
};
