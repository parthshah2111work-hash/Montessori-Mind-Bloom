const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require("@expo/config-plugins");

module.exports = (config) => {
  // 1. ROOT FIX: Kotlin 2.1.20 (Verified working)
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      content = content.replace(
        /buildscript\s*{/,
        "buildscript {\n    ext.kotlinVersion = '2.1.20'",
      );
      content = content.replace(/1\.9\.24/g, "2.1.20");
      config.modResults.contents = content;
    }
    return config;
  });

  // 2. APP FIX: Purge all deprecated/conflicting properties
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Delete the lines that cause Line 96 and Line 115 crashes
      content = content.replace(/enableBundleCompression\s*=\s*.*?\n/g, "\n");
      content = content.replace(/preloadedNativeModules\s*=\s*.*?\n/g, "\n");
      content = content.replace(/hermesEnabled\s*=\s*.*?\n/g, "\n");

      config.modResults.contents = content;
    }
    return config;
  });

  return config;
};
