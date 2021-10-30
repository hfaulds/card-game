const { withSuperjson } = require('next-superjson')

module.exports = withSuperjson()({
  env: {
    NEXTAUTH_URL: `https://${process.env.VERCEL_URL}`
  },
  images: {
    domains: ['lh3.googleusercontent.com']
  }
});
