const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  stats: { 
    errorDetails: true,
  },
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      "path": require.resolve("path-browserify")
    },
    alias: {
      '@actions': path.resolve(__dirname, 'src/actions/'),
      '@models': path.resolve(__dirname, 'src/models/'),
      '@localtypes': path.resolve(__dirname, 'src/types/'),
      '@parsers': path.resolve(__dirname, 'src/parsers/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '' },
      ],
    }),
  ],
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8081,
  },
};
