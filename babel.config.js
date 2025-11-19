module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add this line exactly here:
      'react-native-reanimated/plugin',
    ],
  };
};