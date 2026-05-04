const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require("@expo/config-plugins");

module.exports = (config) => {
  // Fix 1: Force Kotlin Version in Root build.gradle
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      content = content.replace(
        /kotlinVersion\s*=\s*['"][^'"]*['"]/g,
        "kotlinVersion = '2.1.20'",
      );
      if (!content.includes("kotlinVersion = '2.1.20'")) {
        content = content.replace(
          /buildscript\s*{/,
          "buildscript {\n    ext.kotlinVersion = '2.1.20'",
        );
      }
      content = content.replace(/1\.9\.24/g, "2.1.20");
      config.modResults.contents = content;
    }
    return config;
  });

  // Fix 2: THE CRITICAL ONE - Purge Line 93 from app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      // This regex finds the enableBundleCompression line regardless of spaces/values and deletes it
      content = content.replace(/enableBundleCompression\s*=\s*.*?\n/g, "\n");
      config.modResults.contents = content;
    }
    return config;
  });

  return config;
};
