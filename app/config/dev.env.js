var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_URL: '"http://10.70.17.163:8081"',
  MSO_PORTAL_BASE_URL:'"http://10.70.17.163:3210"'
})
