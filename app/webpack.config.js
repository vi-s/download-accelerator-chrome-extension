module.exports = [
  require('./config/webpack.prod.js'), // compile all front-end popup related code
  require('./config/webpack.bg.js') // compile background page code
]