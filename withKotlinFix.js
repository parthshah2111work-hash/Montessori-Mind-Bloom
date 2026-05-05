const {
  withProjectBuildGradle,
  withAppBuildGradle
} = require("@expo/config-plugins");

module.exports = (config) => {
  // 1. ROOT FIX: Align to Stable 2.1.0
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Force Stable 2.1.0
      if (!content.includes("kotlinVersion = '2.1.0'")) {
        content = content.replace(
          /buildscript\s*{/,
          "buildscript {\n    ext.kotlinVersion = '2.1.0'"
        );
      }
      // Clean up all previous experimental attempts
      content = content.replace(/1\.9\.24/g, "2.1.0");
      content = content.replace(/2\.1\.20/g, "2.1.0");
      content = content.replace(/2\.1\.0-RC2/g, "2.1.0");

      config.modResults.contents = content;
    }
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // 2. QUADRUPLE PURGE (Confirmed working)
      const propertiesToPurge = [
        /enableBundleCompression\s*=\s*.*?\n/g,
        /preloadedNativeModules\s*=\s*.*?\n/g,
        /hermesEnabled\s*=\s*.*?\n/g,
        /apply\s+from:\s+.*fix-prefab\.gradle.*\n/g 
      ];

      propertiesToPurge.forEach((regex) => {
        content = content.replace(regex, "\n");
      });

      // 3. COMPOSE & KSP STABLE RESOLUTION
      if (content.includes("android {")) {
        const resolutionFix = `
    configurations.all {
        resolutionStrategy {
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