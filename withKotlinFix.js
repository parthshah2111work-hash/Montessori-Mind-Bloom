const { withProjectBuildGradle, withAppBuildGradle } = require("@expo/config-plugins");

module.exports = (config) => {
  // 1. ROOT FIX: Remove the risky text replacement and just append the force
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Add the global kotlinVersion at the very top of buildscript if not present
      if (!content.includes("kotlinVersion = '2.1.0'")) {
        content = content.replace(
          "buildscript {",
          "buildscript {\n    ext.kotlinVersion = '2.1.0'"
        );
      }
      config.modResults.contents = content;
    }
    return config;
  });

  // 2. APP FIX: The "Safe" Purge + Global Force
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      const propertiesToPurge = [
        /enableBundleCompression\s*=\s*.*?\n/g,
        /preloadedNativeModules\s*=\s*.*?\n/g,
        /hermesEnabled\s*=\s*.*?\n/g,
        /apply\s+from:\s+.*fix-prefab\.gradle.*\n/g 
      ];
      propertiesToPurge.forEach((regex) => { content = content.replace(regex, ""); });

      if (content.includes("android {")) {
        const resolutionFix = `
    configurations.all {
        resolutionStrategy {
            force "org.jetbrains.kotlin:kotlin-stdlib:2.1.0"
            force "org.jetbrains.kotlin:kotlin-reflect:2.1.0"
            force "com.google.devtools.ksp:symbol-processing-api:2.1.0-1.0.29"
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