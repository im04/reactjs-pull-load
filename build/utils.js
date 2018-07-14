'use strict'
const path = require('path')

exports.assetsPath = function (_path) {
	return path.resolve(__dirname, '../', _path)
};

