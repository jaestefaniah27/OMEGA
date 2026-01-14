const RN = require('react-native-web');

module.exports = {
  ...RN,
  TurboModuleRegistry: {
    get: () => null,
    getEnforcing: () => null,
  },
  // Add other missing native modules here if needed
};
