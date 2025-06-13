/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidSupportExcludes(config) {
  return withAppBuildGradle(config, (modConfig) => {
    const exclusionBlock = `
    configurations.all {
        exclude group: "com.android.support", module: "support-compat"
        exclude group: "com.android.support", module: "animated-vector-drawable"
        exclude group: "com.android.support", module: "support-vector-drawable"
        exclude group: "com.android.support", module: "versionedparcelable"
    }`;
    
    if (!modConfig.modResults.contents.includes('exclude group: "com.android.support"')) {
      const updatedConfig = { ...modConfig };
      updatedConfig.modResults.contents = modConfig.modResults.contents.replace(
        /(android\s*\{)/,
        `$1${exclusionBlock}`
      );
      return updatedConfig;
    }
    
    return modConfig;
  });
};