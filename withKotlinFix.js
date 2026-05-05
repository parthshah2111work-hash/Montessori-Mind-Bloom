const {
  withProjectBuildGradle,
  withAppBuildGradle
} = require("@expo/config-plugins");

module.exports = (config) => {
  // 1. ROOT FIX: Align Kotlin to 2.1.0-RC2 for Compose Compatibility
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      // Inject explicit version and replace any existing 2.1.20 or 1.9.24
      if (!content.includes("kotlinVersion = '2.1.0-RC2'")) {
        content = content.replace(
          /buildscript\s*{/,
          "buildscript {\n    ext.kotlinVersion = '2.1.0-RC2'"
        );
      }
      content = content.replace(/1\.9\.24/g, "2.1.0-RC2");
      content = content.replace(/2\.1\.20/g, "2.1.0-RC2");

      config.modResults.contents = content;
    }
    return config;
  });

  // 2. APP FIX: The "Quadruple Purge" (Compression, Modules, Hermes, and Worklets)
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;

      const propertiesToPurge = [
        /enableBundleCompression\s*=\s*.*?\n/g,
        /preloadedNativeModules\s*=\s*.*?\n/g,
        /hermesEnabled\s*=\s*.*?\n/g,
        /apply\s+from:\s+.*fix-prefab\.gradle.*\n/g // Successfully bypassed the worklets error
      ];

      propertiesToPurge.forEach((regex) => {
        content = content.replace(regex, "\n");
      });

      // 3. FORCE COMPOSE COMPILER ALIGNMENT
      if (content.includes("android {")) {
        const composeFix = `
    configurations.all {
        resolutionStrategy {
            force "org.jetbrains.kotlin:kotlin-compiler-embeddable:2.1.0-RC2"
        }
    }
`;
        content = content.replace("android {", "android {" + composeFix);
      }

      config.modResults.contents = content;
    }
    return config;
  });

  return config;
};