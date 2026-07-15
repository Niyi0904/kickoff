function readPackageHook(pkg) {
  // Approve build scripts for these packages
  if (
    pkg.name === '@firebase/util' ||
    pkg.name === 'msw' ||
    pkg.name === 'protobufjs' ||
    pkg.name === 'sharp' ||
    pkg.name === 'unrs-resolver'
  ) {
    pkg.pnpm = pkg.pnpm || {};
    pkg.pnpm.allowBuild = true;
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage: readPackageHook,
  },
};
