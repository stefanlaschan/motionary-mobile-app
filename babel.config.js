module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // This must be the first item
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
