const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // Ensures old files in the dist folder are cleaned
    },
    mode: 'development', // Change to 'production' for optimized builds
    resolve: {
        extensions: ['.ts', '.js'], // Resolve .ts and .js files
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/, // Exclude node_modules for faster builds
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(), // Automatically cleans the dist directory
    ],
    devtool: 'source-map', // Enable source maps for easier debugging
    devServer: {
        static: path.resolve(__dirname, 'dist'), // Serve content from the dist folder
        compress: true,
        port: 9000, // Development server runs on port 9000
    },
};
