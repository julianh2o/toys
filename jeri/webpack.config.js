const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/js/app.js',
	mode: "development",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
	},
	resolve: {
		extensions: ['.js', '.txt']
	},
	devServer: {
		contentBase: './dist'
	},
	module: {
		noParse: /node_modules\/lodash\/lodash\.js/,
		rules: [
			{ parser: { amd: false } },
			{
        test: /\.(png|jpg|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
			{
        test: /\.(ttf)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
			{
        test: /\.txt$/i,
        loader: 'raw-loader',
      },
			{
				test: /\.js?$/,
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: [
					"style-loader",
					"css-loader"
				]
			},
			{
				test: /\.mp3$/,
				exclude: /node_modules/,
				use: [
					{ loader: 'file-loader' }
				]
			}
		]
	},
	plugins: [
    new HtmlWebpackPlugin({
			template: './src/index.html'
		})
  ],
}