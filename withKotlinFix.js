const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require("@expo/config-plugins");

module.exports = (config) => {
  // 1. PROACTIVE ROOT FIX: Prevents "unknown property kotlinVersion"
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      // Force define the variable before any plugin tries to call it
      content = content.replace(
        /buildscript\s*{/,
        "buildscript {\n    ext.kotlinVersion = '2.1.20'",
      );
      // Global purge of the old 1.9.24 version
      content = content.replace(/1\.9\.24/g, "2.1.20");
      config.modResults.contents = content;
    }
    return config;
  });

  // 2. PROACTIVE APP FIX: Purges deprecated properties for RN 0.76
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // FIX Line 96/98: Removes 'enableBundleCompression' (Deprecated in RN 0.76)
      content = content.replace(/enableBundleCompression\s*=\s*.*?\n/g, "\n");

      // FIX Line 105 (Proactive): Removes 'preloadedNativeModules' (Often causes next failure)
      content = content.replace(/preloadedNativeModules\s*=\s*.*?\n/g, "\n");

      // FIX (Proactive): Ensures Hermes engine is correctly flagged
      if (!content.includes("hermesEnabled = true")) {
        content = content.replace(
          /react\s*{/,
          "react {\n    hermesEnabled = true",
        );
      }

      config.modResults.contents = content;
    }
    return config;
  });

  return config;
};
