const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /\/backend\/.*/,
  /\/server\/.*/,
];

config.watchFolders = [__dirname];

module.exports = config;
