const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require("@expo/config-plugins");

module.exports = (config) => {
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      if (!content.includes("kotlinVersion = '2.0.20'")) {
        content = content.replace(
          "buildscript {",
          "buildscript {\n    ext.kotlinVersion = '2.0.20'",
        );
      }
      config.modResults.contents = content;
    }
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Purge crashing properties
      const propertiesToPurge = [
        /enableBundleCompression\s*=\s*.*?\n/g,
        /hermesEnabled\s*=\s*.*?\n/g,
        /apply\s+from:\s+.*fix-prefab\.gradle.*\n/g,
      ];
      propertiesToPurge.forEach((regex) => {
        content = content.replace(regex, "");
      });

      if (content.includes("android {")) {
        const resolutionFix = `
    configurations.all {
        resolutionStrategy {
            force "org.jetbrains.kotlin:kotlin-stdlib:2.0.20"
            force "org.jetbrains.kotlin:kotlin-reflect:2.0.20"
            force "com.google.devtools.ksp:symbol-processing-api:2.0.20-1.0.24"
        }
    }
`;
        content = content.replace("android {", "android {" + resolutionFix);
      }
      config.modResults.contents = content;
    }
    return config;
  });
  return config;
};
