const { withProjectBuildGradle, withAppBuildGradle } = require("@expo/config-plugins");

module.exports = (config) => {
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      content = content.replace(/kotlinVersion\s*=\s*['"].*?['"]/g, "kotlinVersion = '1.9.24'");
      content = content.replace(
        /classpath\s*['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin:.*?['"]/g,
        "classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24'"
      );
      config.modResults.contents = content;
    }
    return config;
  });

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
            force "org.jetbrains.kotlin:kotlin-stdlib:1.9.24"
            force "org.jetbrains.kotlin:kotlin-compiler-embeddable:1.9.24"
            force "com.google.devtools.ksp:symbol-processing-api:1.9.24-1.0.20"
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