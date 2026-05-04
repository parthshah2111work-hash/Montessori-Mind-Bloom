const { withProjectBuildGradle, withAppBuildGradle } = require("@expo/config-plugins");

module.exports = (config) => {
  // 1. ROOT FIX: Kotlin 2.1.20
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      if (!content.includes("kotlinVersion = '2.1.20'")) {
        content = content.replace(/buildscript\s*{/, "buildscript {\n    ext.kotlinVersion = '2.1.20'");
      }
      content = content.replace(/1\.9\.24/g, "2.1.20");
      config.modResults.contents = content;
    }
    return config;
  });

  // 2. APP FIX: The "Triple Purge" (Compression, Modules, Hermes)
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Use a broader regex to ensure these 3 lines are GONE
      const propertiesToPurge = [
        /enableBundleCompression\s*=\s*.*?\n/g,
        /preloadedNativeModules\s*=\s*.*?\n/g,
        /hermesEnabled\s*=\s*.*?\n/g
      ];

      propertiesToPurge.forEach(regex => {
        content = content.replace(regex, "\n");
      });

      config.modResults.contents = content;
    }
    return config;
  });

  return config;
};