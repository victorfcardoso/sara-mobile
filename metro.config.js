const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const withStorybook = require('@storybook/react-native/metro/withStorybook');
const { loadConfig, createMatchPath } = require('tsconfig-paths');
const { resolve } = require('metro-resolver');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);
const sentryConfig = getSentryExpoConfig(__dirname);
const tsConfigResult = loadConfig(__dirname);
const matchPath =
  tsConfigResult.resultType === 'success'
    ? createMatchPath(tsConfigResult.absoluteBaseUrl, tsConfigResult.paths)
    : null;

// Merge Sentry config with default config
const config = {
  ...defaultConfig,
  ...sentryConfig,
  resolver: {
    ...(defaultConfig.resolver || {}),
    ...(sentryConfig.resolver || {}),
    alias: {
      ...((defaultConfig.resolver || {}).alias || {}),
      ...((sentryConfig.resolver || {}).alias || {}),
      '@': path.resolve(__dirname, 'src'),
    },
    extraNodeModules: {
      ...((defaultConfig.resolver || {}).extraNodeModules || {}),
      ...((sentryConfig.resolver || {}).extraNodeModules || {}),
      '@': path.resolve(__dirname, 'src'),
    },
  },
};

if (matchPath) {
  const sourceExts = (config.resolver && config.resolver.sourceExts) || [];
  const extensions = sourceExts.map(ext => `.${ext}`);
  const previousResolveRequest =
    (config.resolver && config.resolver.resolveRequest) ||
    ((ctx, moduleName, platform) => resolve(ctx, moduleName, platform));

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const matchedPath = matchPath(moduleName, undefined, undefined, extensions);
    if (matchedPath) {
      return previousResolveRequest(context, matchedPath, platform);
    }
    return previousResolveRequest(context, moduleName, platform);
  };
}

module.exports = withStorybook(config, {
  enabled: true,
  configPath: path.resolve(__dirname, './.storybook'),
});
