var constants = require('./constants');
var baseConfig = require('./webpack.config');

module.exports = Object.assign(baseConfig, {
    output: {
        library: 'withObserve',
        filename: 'flight-with-observe.js',
        libraryTarget: 'umd',
        path: constants.BUILD_DIRECTORY
    },
    externals: [
        'rx'
    ]
});
