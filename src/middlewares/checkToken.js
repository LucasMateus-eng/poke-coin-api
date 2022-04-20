require('dotenv').config();
const jwt = require("jsonwebtoken");

const checkToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send({ message: "Acesso proibido!" });

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret, function (err, decoded) {
      if (err) return res.status(500).send({ error: 'Falha ao autenticar o token.' });

      // se tudo estiver ok, salva no request, para uso posterior
      req.userId = decoded.id;
      next();
    });
  } catch (e) {
    console.log(e);

    res.status(400).send({ error: "O Token é inválido!" });
  }
}

module.exports = checkToken;