const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
console.log(' process.env.API_ENV wp ', process.env.API_ENV )

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'bundle.js',
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, './public'),
    },
    compress: false,
    port: 9001,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
      },
      {
        test: /\.(ts)x?$/, // add |ts
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'], // add .tsx, .ts
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'public/app.html',
      inject: false,
    }),
    new webpack.DefinePlugin({
     'process.env.API_ENV':JSON.stringify( process.env.API_ENV),
      // ...
    })
  ],
}
