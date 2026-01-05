module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@features': './src/features',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@state': './src/state',
          '@utils': './src/utils',
          '@config': './src/config',
          '@assets': './src/assets',
          '@types': './src/types',
        },
      },
    ],
  ],
};
