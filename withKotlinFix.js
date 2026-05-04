const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // The "Ultimate Force": Locate the buildscript and inject kotlinVersion globally
      if (!content.includes("kotlinVersion = '2.1.20'")) {
        content = content.replace(
          /buildscript\s*{/,
          "buildscript {\n    ext.kotlinVersion = '2.1.20'",
        );
      }

      // Safety check: remove any 1.9.24 "ghosts"
      content = content.replace(/1\.9\.24/g, "2.1.20");

      config.modResults.contents = content;
    }
    return config;
  });
};
