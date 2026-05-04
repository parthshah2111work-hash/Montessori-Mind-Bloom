const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let content = config.modResults.contents;
      // Manually inject the kotlinVersion into the ext block
      if (!content.includes("kotlinVersion =")) {
        content = content.replace(
          /ext\s*{/,
          "ext {\n        kotlinVersion = '2.1.20'"
        );
      }
      config.modResults.contents = content;
    }
    return config;
  });
};
