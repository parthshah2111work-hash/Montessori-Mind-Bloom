const { withProjectBuildGradle, withAppBuildGradle } = require("@expo/config-plugins");

module.exports = (config) => {
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      if (!content.includes("kotlinVersion = '2.0.0'")) {
        content = content.replace("buildscript {", "buildscript {\n    ext.kotlinVersion = '2.0.0'");
      }
      config.modResults.contents = content;
    }
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let content = config.modResults.contents;
      const propertiesToPurge = [/enableBundleCompression\s*=\s*.*?\n/g, /hermesEnabled\s*=\s*.*?\n/g, /apply\s+from:\s+.*fix-prefab\.gradle.*\n/g];
      propertiesToPurge.forEach((regex) => { content = content.replace(regex, ""); });

      if (content.includes("android {")) {
        const resolutionFix = `
    configurations.all {
        resolutionStrategy {
            force "org.jetbrains.kotlin:kotlin-stdlib:2.0.0"
            force "org.jetbrains.kotlin:kotlin-reflect:2.0.0"
            force "com.google.devtools.ksp:symbol-processing-api:2.0.0-1.0.21"
        }
    }
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).all {
        kotlinOptions {
            allWarningsAsErrors = false
            freeCompilerArgs += [
                "-Xexpect-actual-classes",
                "-Xskip-metadata-version-check",
                "-Xsuppress-version-warnings",
                "-Xno-call-assertions",
                "-Xno-receiver-assertions",
                "-Xcontext-receivers"
            ]
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