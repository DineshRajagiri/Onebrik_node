const path = require('path');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  mode: 'development',
  optimization: {
    minimize: false,
    splitChunks: false,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
            compilerOptions: {
              incremental: false,
              declaration: false,
              sourceMap: false,
            },
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: false,
  },
  stats: 'minimal',
  performance: {
    hints: false,
  },
};