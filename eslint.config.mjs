// eslint.config.js
import pluginRouter from '@tanstack/eslint-plugin-router'

export default [
  {
    plugins: {
      '@tanstack/router': pluginRouter,
    },
    rules: {
      '@tanstack/router/create-route-property-order': 'error',
    },
  },
  // Any other config...
]