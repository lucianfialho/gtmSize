const CopyPlugin = require("copy-webpack-plugin");
const path = require("path")
module.exports = {
    mode: "development",
    entry: "./src/test.js",
    module: {
        rules: [{
            test: /\.js$/,
            use: "raw-loader",
            exclude: /node_modules/
        }],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { 
                    from: path.resolve("src/manifest.json"),
                    to: path.resolve("dist")
                },
                { 
                    from: path.resolve("src/assets/icon-16x16.png"),
                    to: path.resolve("dist")
                },
                { 
                    from: path.resolve("src/assets/icon-38x38.png"),
                    to: path.resolve("dist")
                },
                { 
                    from: path.resolve("src/assets/icon-48x48.png"),
                    to: path.resolve("dist")
                },
                { 
                    from: path.resolve("src/assets/icon-128x128.png"),
                    to: path.resolve("dist")
                },
            ]
        })
    ],
    output: {
        filename: "index.js"
    }
}