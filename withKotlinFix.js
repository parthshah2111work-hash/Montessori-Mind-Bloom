const {
  withProjectBuildGradle,
  withAppBuildGradle
} = require("@expo/config-plugins");

module.exports = (config) => {
  // 1. ROOT FIX: Force the 2.1.0 Plugin and Compiler
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Update variables
      content = content.replace(/kotlinVersion\s*=\s*['"].*?['"]/g, "kotlinVersion = '2.1.0'");

      // CRITICAL: Overwrite the actual plugin classpath to 2.1.0
      content = content.replace(
        /classpath\s*['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin:.*?['"]/g,
        "classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.0'"
      );

      config.modResults.contents = content;
    }
    return config;
  });

  // 2. APP FIX: Quadruple Purge + Resolution Strategy
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      const propertiesToPurge = [
        /enableBundleCompression\s*=\s*.*?\n/g,
        /preloadedNativeModules\s*=\s*.*?\n/g,
        /hermesEnabled\s*=\s*.*?\n/g,
        /apply\s+from:\s+.*fix-prefab\.gradle.*\n/g 
      ];

      propertiesToPurge.forEach((regex) => {
        content = content.replace(regex, "\n");
      });

      if (content.includes("android {")) {
        const resolutionFix = `
    configurations.all {
        resolutionStrategy {
            force "org.jetbrains.kotlin:kotlin-stdlib:2.1.0"
            force "org.jetbrains.kotlin:kotlin-compiler-embeddable:2.1.0"
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