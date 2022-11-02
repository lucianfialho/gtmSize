const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "cheap-module-source-map",
    entry: {
        popup: "./src/popup/popup.js"
    },
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
                { 
                    from: path.resolve("src/background.js"),
                    to: path.resolve("dist")
                },
            ]
        }),
        new HtmlPlugin({
            title: "Gtm size",
            filename: "popup.html",
            chunks: ["popup"]
        })
    ],
    output: {
        filename: "[name].js"
    }
}