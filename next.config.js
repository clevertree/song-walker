const path = require("path");
/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.(song)$/,
            use: [{
                loader: path.join(process.cwd(), 'songWalker/song/compiler.js')
            }]
        })

        return config
    },
}

module.exports = nextConfig
