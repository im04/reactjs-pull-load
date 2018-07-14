'use strict';
const path = require('path');
const utils = require('./utils');
const CopyWebpackPlugin = require('copy-webpack-plugin');
function resolve (dir) {
	return path.join(__dirname, '../', dir)
}
let config = {
	context: path.resolve(__dirname, './'),
	resolve: {
		extensions: ['.js', '.json'],
		alias: {
			'@': resolve('src'),
		}
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: [
					{
						loader: 'babel-loader',
					}
				],
				// include: [resolve('demo'), resolve('src'), resolve('node_modules/webpack-dev-server/client')]
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: true,
							importLoaders: 1,
                            localIdentName: '[name]-[local]-[hash:base64:5]'
						}
					},
					'postcss-loader'
				],
				/*loader: "style-loader!css-loader?modules!postcss-loader"*/
			},
			{
				test: /\.less$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader'
					},
					{
						loader: 'less-loader',
						options: { javascriptEnabled: true }
					}
				],
				include: [resolve('node_modules')]
				/*loader: "style-loader!css-loader?modules!postcss-loader"*/
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: utils.assetsPath('img/[name].[hash:7].[ext]')
				}
			},
			{
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: utils.assetsPath('media/[name].[hash:7].[ext]')
				}
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
				}
			}
		]
	},
	// optimization: {
	// 	splitChunks: {
	// 		chunks: "all", // 必须三选一： "initial" | "all"(默认就是all) | "async"
	// 		minSize: 0, // 最小尺寸，默认0
	// 		minChunks: 1, // 最小 chunk ，默认1
	// 		maxAsyncRequests: 5, // 最大异步请求数， 默认1
	// 		maxInitialRequests : 5, // 最大初始化请求书，默认1
	// 		cacheGroups: {
     //            commons: {
     //                test: /src/,
     //                chunks: 'initial',
     //                minChunks: 2,
     //                maxInitialRequests: 5,
     //                minSize: 0
     //            },
	// 			vendors: {
	// 				test: /[\\/]node_modules[\\/]/,
     //                name: 'vendors',
	// 				priority: -20
	// 			}
	// 		}
	// 	}
	// },
	plugins: [
		/*new webpack.ProvidePlugin({
			React: 'react',
		}),*/
		// new CopyWebpackPlugin([
		// 	{
		// 		from: path.resolve(__dirname, '../static'),
		// 		to: './static',
		// 		ignore: ['.*']
		// 	}
		// ])
	]
};

// config.plugins.push(new BundleAnalyzerPlugin());

module.exports = config;
