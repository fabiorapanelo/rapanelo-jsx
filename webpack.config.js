const path = require('path');

module.exports = {
	mode: 'production',
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'rapanelo-jsx.js',
		library: 'rapanelo-jsx',
		libraryTarget: 'umd',
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			}
		],
	},
	resolve: {
		extensions: ['.js'],
	},
};
