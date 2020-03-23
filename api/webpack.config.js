const path = require('path')
const slsw = require('serverless-webpack')

//import slsw from 'serverless-webpack'
//import { join, dirname } from 'path'
//import { fileURLToPath } from 'url'

module.exports = {
//export default {
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        type: "javascript/esm",
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          }
        ],
      }
    ]
  },
  output: {
    libraryTarget: 'commonjs',
    //path: join(dirname(fileURLToPath(import.meta.url)), '.webpack'),
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  }
}
