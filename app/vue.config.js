const webpack = require("webpack");
const {defineConfig} = require("@vue/cli-service");

module.exports = defineConfig({
    transpileDependencies: true,
    configureWebpack: {
        plugins: [
            /* Activate Buffer Polyfill */
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"]
            })
        ],
        resolve: {
            fallback: {
                /* Deactivate other Polyfills */
                crypto: false,
                fs: false,
                assert: false,
                process: false,
                util: false,
                path: false
            }
        }
    }
});