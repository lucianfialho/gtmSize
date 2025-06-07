const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: "development",
  devtool: "cheap-module-source-map",
  entry: {
    sidepanel: "./src/sidepanel.js",
    background: "./src/background.js"
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    assetModuleFilename: 'assets/[name][ext]',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
      template: "./src/sidepanel.html",
      filename: "sidepanel.html",
      chunks: ["sidepanel"],
      inject: 'body',
      scriptLoading: 'module',
      minify: false
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve("src/manifest.json"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("src/popup/App.js"),
          to: path.resolve("dist/popup"),
        },
        {
          from: path.resolve("src/static/icon-16x16.png"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("src/static/icon-38x38.png"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("src/static/icon-48x48.png"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("src/static/icon-128x128.png"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("src/background.js"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("src/performance.js"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("src/content.js"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("src/sidepanel.css"),
          to: path.resolve("dist"),
          noErrorOnMissing: true,
        },
        {
          from: path.resolve("src/assets"),
          to: path.resolve("dist/assets"),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    }
  },
  optimization: {
    minimize: false
  }
};
