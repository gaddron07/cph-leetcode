const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development", // Use "production" for production builds
  entry: "./src/extension.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2", // Compatible with Node.js
  },
  target: "node",
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "clone-deep": require.resolve("lodash.clonedeep"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        parser: {
          requireEnsure: false, // Suppress unnecessary warnings
        },
      },
    ],
  },
  externals: {
    "puppeteer-extra-plugin-stealth": "commonjs puppeteer-extra-plugin-stealth",
    vscode: "commonjs vscode", // Keep VSCode API external
  },
  ignoreWarnings: [
    {
      module: /clone-deep|cosmiconfig|yargs|puppeteer|typescript/, // Suppress non-critical warnings
    },
  ],
  stats: {
    errorDetails: true, // Enable detailed error information
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /import-fresh/, // Suppress warnings for import-fresh
    }),
  ],
};
