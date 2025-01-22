const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: "./src/extension.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
  },
  target: "node",
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "clone-deep": require.resolve("lodash.clonedeep"),
    },
    fallback: {
      fs: false,
      path: require.resolve("path-browserify"),
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
          requireEnsure: false,
        },
      },
    ],
  },
  externals: {
    vscode: "commonjs vscode", // Exclude VSCode API from bundling
  },
  ignoreWarnings: [
    {
      module: /clone-deep|cosmiconfig|yargs|puppeteer|typescript/,
    },
  ],
  stats: {
    errorDetails: true, // Show detailed error information
  },
  plugins: [
    // Add the IgnorePlugin to suppress the import-fresh warning
    new webpack.IgnorePlugin({
      resourceRegExp: /import-fresh/,
    }),
  ],
};


