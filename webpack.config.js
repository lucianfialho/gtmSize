const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "cheap-module-source-map",
    entry: {
        popup: path.resolve("./src/popup/popup.js")
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            }
        ]
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
            chunks: ["popup"],
            templateContent: `
                <html>
                    <body>
                        <div id='root'></div>
                    </body>
                </html>
            `
        })
    ],
    resolve: {
        extensions: ['.js']
    },
    output: {
        filename: "[name].js"
    }
}