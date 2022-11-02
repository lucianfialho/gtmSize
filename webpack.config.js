module.exports = {
    mode: "development",
    entry: "./src/test.js",
    module: {
        rules: [{
            test: /\.js$/,
            use: 'raw-loader',
            exclude: /node_modules/
        }],
    },
    output: {
        filename: "index.js"
    }
}