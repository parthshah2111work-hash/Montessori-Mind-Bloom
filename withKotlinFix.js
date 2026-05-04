const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Force Kotlin 2.1.20 into the top-level ext block
      // This solves the "unknown property" error at Line 11/72
      if (!content.includes("kotlinVersion = '2.1.20'")) {
        content = content.replace(
          /buildscript\s*{/,
          "buildscript {\n    ext.kotlinVersion = '2.1.20'",
        );
      }

      // Wipe out any reference to the old 1.9.24 version
      content = content.replace(/1\.9\.24/g, "2.1.20");

      config.modResults.contents = content;
    }
    return config;
  });
};
