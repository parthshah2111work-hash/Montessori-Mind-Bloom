const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require("@expo/config-plugins");

module.exports = (config) => {
  // Fix 1: Root build.gradle (Kotlin Version)
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      // Force Kotlin 2.1.20
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

  // Fix 2: App build.gradle (Line 96: Remove obsolete property)
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      // Remove 'enableBundleCompression' completely to satisfy RN 0.76
      content = content.replace(
        /enableBundleCompression\s*=\s*(true|false)/g,
        "",
      );
      config.modResults.contents = content;
    }
    return config;
  });

  return config;
};
