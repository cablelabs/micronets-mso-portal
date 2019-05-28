var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_URL: '"http://127.0.0.1:8081"',
  MSO_PORTAL_BASE_URL:'"http://127.0.0.1:3210"'
})
