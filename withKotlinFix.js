const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Force Kotlin 2.1.20 in the ext block
      content = content.replace(
        /kotlinVersion\s*=\s*['"][^'"]*['"]/g,
        "kotlinVersion = '2.1.20'",
      );

      // Force all other references to 2.1.20
      if (!content.includes("kotlinVersion =")) {
        content = content.replace(
          /ext\s*{/,
          "ext {\n        kotlinVersion = '2.1.20'",
        );
      }

      config.modResults.contents = content;
    }
    return config;
  });
};
