const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add GLB/GLTF 3D model support
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'glb', 'gltf'],
};

// Optimize Metro for large packages like Skia
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true, // Required for Reanimated
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Increase Node.js memory
process.env.NODE_OPTIONS = '--max-old-space-size=8192';

module.exports = config;
