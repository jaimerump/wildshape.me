const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Prefer the react-native (CJS) export condition over the ESM `import` condition.
// Without this, packages like zustand v5 resolve to their ESM builds which use
// `import.meta.env` — a syntax the Hermes/Metro web transformer cannot handle.
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
];

module.exports = withNativeWind(config, { input: './global.css' });
