const User = require('../app/models/user');

const userAlreadyExists = async (req, res, next) => {
  try {
    const { cpf } = req.body;

    const user = await User.findOne({ cpf });

    if (user) {
      return res.status(422).send({ message: 'Usuário já cadastrado!' })
    }

    next();
  } catch (e) {
    res.status(500).send({ error: 'Falha ao buscar usuário.' });
  }
}

module.exports = userAlreadyExists;