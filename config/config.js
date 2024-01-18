const dev = require("./dev");
const prod = require("./prod");

console.log('app env is ' + process.env.NODE_ENV)

if (process.env.NODE_ENV === 'production') {
    module.exports = prod;
  } else {
    module.exports = dev;
}