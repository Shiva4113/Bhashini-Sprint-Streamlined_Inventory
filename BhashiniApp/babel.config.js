module.exports = function(api) {
  api.cache(true);

  const presets = ['babel-preset-expo'];
  const plugins = [];


  if (process.env.NODE_ENV === 'development') {
    plugins.push('transform-inline-environment-variables');
  }

  return {
    presets,
    plugins
  };
};
