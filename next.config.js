const { withSuperjson } = require('next-superjson')
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = withSuperjson()({
  env: {
    NEXTAUTH_URL: `https://${process.env.VERCEL_URL}`
  },
  images: {
    domains: ['lh3.googleusercontent.com']
  },
  webpack(config, options) {
    const { dev, isServer } = options;

    // Do not run type checking twice:
    if (dev && isServer) {
      config.plugins.push(new ForkTsCheckerWebpackPlugin());
    }

    return config;
  }
});
