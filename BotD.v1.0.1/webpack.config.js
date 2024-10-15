const path = require('path');

module.exports = {
  entry: './src/index.ts',  // Your main entry file
  output: {
    filename: 'bundle.js',  // Output file
    path: path.resolve(__dirname, 'public'),  // Output folder
  },
  resolve: {
    extensions: ['.ts', '.js'],  // Resolve TypeScript and JavaScript files
  },
  module: {
    rules: [
      {
        test: /\.ts$/,  // For all .ts files
        use: 'ts-loader',  // Use ts-loader to handle them
        exclude: /node_modules/,  // Exclude node_modules
      },
    ],
  },
  devServer: {
    static: './dist',  // Serve files from the dist folder
  },
  mode: 'development',  // You can switch to 'production' later
  watch: true, // Enable watch mode
};
