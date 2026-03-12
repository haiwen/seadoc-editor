const path = require('path');
const { rspack } = require('@rspack/core');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config();

module.exports = (_, argv) => {
  const mode = argv.mode || 'development';
  const isDev = mode === 'development';
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

  return {
    context: __dirname,
    mode,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '/',
      filename: isDev ? 'static/js/[name].js' : 'static/js/[name].[contenthash:8].js',
      chunkFilename: isDev ? 'static/js/[name].chunk.js' : 'static/js/[name].[contenthash:8].chunk.js',
      assetModuleFilename: 'static/media/[name].[contenthash:8][ext]',
      clean: true,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'ecmascript',
                  jsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                  },
                },
              },
            },
          },
        },
        {
          test: /\.css$/i,
          type: 'css',
        },
        {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff2?)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new rspack.HtmlRspackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
      }),
      new rspack.CopyRspackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public'),
            globOptions: {
              ignore: ['**/index.html'],
            },
            noErrorOnMissing: true,
          },
        ],
      }),
      new rspack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),
    ],
    experiments: {
      css: true,
    },
    devtool: shouldUseSourceMap ? (isDev ? 'cheap-module-source-map' : 'source-map') : false,
    devServer: {
      host: process.env.HOST || '127.0.0.1',
      port: Number(process.env.PORT) || 3005,
      historyApiFallback: true,
      hot: true,
      // https: process.env.HTTPS === 'true',
      static: {
        directory: path.resolve(__dirname, 'public'),
      },
    },
  };
};
