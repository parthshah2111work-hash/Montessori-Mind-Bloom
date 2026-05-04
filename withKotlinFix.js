const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require("@expo/config-plugins");

module.exports = (config) => {
  // Fix 1: Root build.gradle (Kotlin Version)
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
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

  // Fix 2: App build.gradle (Remove obsolete enableBundleCompression)
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      // Remove the line causing the Line 98 error
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
