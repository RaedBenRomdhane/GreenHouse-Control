module.exports = function (api) {
    // Enable caching for improved performance
    api.cache(true);
  
    // Return the Babel configuration
    return {
      presets: ['babel-preset-expo'], // This preset is required for Expo projects
    };
  };
  