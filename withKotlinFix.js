const {
  withProjectBuildGradle,
  withAppBuildGradle
} = require("@expo/config-plugins");

module.exports = (config) => {
  // 1. ROOT FIX: Syncing the Plugin with our KOTLIN_VERSION env var
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Force variables to 2.1.0
      content = content.replace(/kotlinVersion\s*=\s*['"].*?['"]/g, "kotlinVersion = '2.1.0'");

      // Overwrite the actual plugin classpath
      content = content.replace(
        /classpath\s*['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin:.*?['"]/g,
        "classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.0'"
      );

      config.modResults.contents = content;
    }
    return config;
  });

  // 2. APP FIX: The "Tighter" Quadruple Purge
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      const propertiesToPurge = [
        /enableBundleCompression\s*=\s*.*?\n/g,
        /preloadedNativeModules\s*=\s*.*?\n/g,
        /hermesEnabled\s*=\s*.*?\n/g,
        /apply\s+from:\s+.*fix-prefab\.gradle.*\n/g 
      ];

      // We use a clean empty string here to ensure NO ghost properties remain
      propertiesToPurge.forEach((regex) => {
        content = content.replace(regex, ""); 
      });

      // 3. ENFORCE STABLE RESOLUTION
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