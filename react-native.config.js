module.exports = {
  assets: ['./src/assets/fonts/'],
  dependencies: {
    'ffmpeg-kit-react-native': {
      platforms: {
        android: null, // 👈 prevents Android autolinking
      },
    },
    '@notifee/react-native': {
      platforms: {
        android: null, // 👈 prevents Android autolinking
      },
    },
  },
};
