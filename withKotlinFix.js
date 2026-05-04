const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let content = config.modResults.contents;

      // Force Kotlin 2.1.20 at the absolute start of buildscript
      if (!content.includes("kotlinVersion = '2.1.20'")) {
        content = content.replace(
          /buildscript\s*{/,
          "buildscript {\n    ext.kotlinVersion = '2.1.20'"
        );
      }

      // Wipe out any old 1.9.24 references that cause KSP errors
      content = content.replace(/1\.9\.24/g, "2.1.20");

      config.modResults.contents = content;
    }
    return config;
  });
};