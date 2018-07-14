const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.dev.conf');
const compiler = Webpack(webpackConfig);
const devServerOptions = Object.assign({}, webpackConfig.devServer, {
	stats: {
		colors: true
	},
	before(app) {
		app.use((req, res, next) => {
			console.log(`Using middleware for ${req.url}`);
			next();
		});
	}
});
const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(webpackConfig.devServer.port, () => {
	console.log('Starting server on http://localhost:' + webpackConfig.devServer.port);
});
