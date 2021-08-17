const jwt = require("jsonwebtoken");
const secret = "decrypt-key";
class JwtManager {
  generate(data) {
    console.log(data);
    const token = jwt.sign(data, secret);
    return token;
  }
  verify(token) {
    const data = jwt.verify(token, secret);
    return data;
  }
}

module.exports = new JwtManager();