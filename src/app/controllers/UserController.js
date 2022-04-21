const User = require('../models/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const consultBalance = require('../../utils/consultBalance');

exports.createUser = async (req, res) => {
  const { name, cpf, email, password } = req.body;

  if (!name) {
    return res.status(422).send({ message: "O nome é obrigatório!" });
  }

  if (!cpf) {
    return res.status(422).send({ message: "O cpf é obrigatório!" });
  }

  if (!email) {
    return res.status(422).send({ message: "O e-mail é obrigatório!" });
  }

  if (!password) {
    return res.status(422).send({ message: "A senha é obrigatória!" });
  };

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    cpf,
    email,
    password: passwordHash
  });

  try {
    await user.save();

    res.status(201).send({ message: 'Usuário cadastrado com sucesso!' });
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: 'Erro ao cadastrar usuário. Tente novamente mais tarde.' });
  }
}

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).send({ message: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).send({ message: "A senha é obrigatória!" });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado!" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).send({ message: "Senha inválida!" });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).send({ message: "Autenticação realizada com sucesso!", token });
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: "Erro ao fazer login. Tente novamente mais tarde." });
  }
}

exports.getUser = async (req, res) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId, "-password");

    return res.status(200).json(user);
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: 'Falha ao acessar usuário.' });
  }
}

exports.makeDeposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const { userId } = req;

    const user = await User.findById(userId, "-password");

    const statementOperation = {
      amount: parseInt(amount),
      created_at: new Date(),
      type: 'credit',
    };

    user.statement.push(statementOperation);

    const userWithInsertOperation = await user.save();
    console.log(userWithInsertOperation);

    return res.status(201).send({ message: 'Depósito realizado com sucesso.' });
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: 'Falha ao processar depósito.' });
  }
}

exports.makeAcquisition = async (req, res) => {
  try {
    const { name, base_experience, quantity, total } = req.body;
    const { userId } = req;

    const user = await User.findById(userId, "-password");

    if (quantity === 0) {
      return res.status(422).send({ message: 'A quantidade do ativo não pode ser 0.' });
    }

    const balance = consultBalance(user.statement);

    if (balance < total) {
      return res.status(422).send({ message: 'Saldo insuficiente. Faça um depósito.' });
    };

    const acquisitionTransaction = {
      name,
      base_experience: parseInt(base_experience),
      quantity: parseInt(quantity),
      total: parseFloat(total),
      created_at: new Date(),
      state: 'purchased'
    };

    const assetInWallet = user.wallet.find((asset) => asset.name === name);

    if (!assetInWallet) {
      user.wallet.push(acquisitionTransaction);
    } else {
      assetInWallet.quantity += parseInt(quantity);
      assetInWallet.total += parseFloat(total);
    }

    //atualizando o statement
    const statementOperation = {
      amount: total,
      created_at: new Date(),
      type: 'debit',
    };

    user.statement.push(statementOperation);

    user.operations.push(acquisitionTransaction);

    const userWithInsertTransaction = await user.save();
    console.log(userWithInsertTransaction);

    return res.status(201).send({ message: 'Operação de compra realizada com sucesso.' });
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: 'Falha ao processar aquisição.' });
  }
}

exports.makeASale = async (req, res) => {
  try {
    const { name, base_experience, quantity, total } = req.body;
    const { userId } = req;

    const user = await User.findById(userId, "-password");

    if (quantity === 0) {
      return res.status(422).send({ message: 'A quantidade do ativo não pode ser 0.' });
    }

    const verifyIfExistsAsset = user.wallet.find((asset) => asset.name === name);

    if (!verifyIfExistsAsset) {
      return res.status(404).send({ message: 'Ativo inexistente na carteira. Faça uma compra.' });
    }

    if (quantity > verifyIfExistsAsset.quantity) {
      return res.status(400).send({ message: 'Ativo com quantidade insuficiente para a venda.' });
    }

    const salesTransaction = {
      name,
      base_experience: parseInt(base_experience),
      quantity: parseInt(quantity),
      total: parseFloat(total),
      created_at: new Date(),
      state: 'sold'
    };

    // atualizando o wallet
    const assetInWallet = user.wallet.find((asset) => asset.name === name);

    if (assetInWallet.quantity - parseInt(quantity) === 0) {
      user.wallet.splice(assetInWallet, 1);
    } else {
      assetInWallet.quantity -= parseInt(quantity);
      assetInWallet.total -= parseFloat(total);
    }

    //atualizando o statement
    const statementOperation = {
      amount: parseFloat(total),
      created_at: new Date(),
      type: 'credit',
    };

    user.statement.push(statementOperation);

    user.operations.push(salesTransaction);

    const userWithInsertTransaction = await user.save();
    console.log(userWithInsertTransaction);

    return res.status(201).send({ message: 'Operação de venda realizada com sucesso.' });
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: 'Falha ao processar venda.' });
  }
}

exports.getBalance = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId, "-password");

    const balance = consultBalance(user.statement);

    return res.status(200).json(balance);
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: 'Falha ao consultar saldo.' });
  }
}

exports.getAllOperations = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId, "-password");

    const operations = user.operations;

    return res.status(200).json(operations);
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: 'Falha ao consultar o histórico das operações realizadas.' });
  }
}

exports.getWallet = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId, "-password");

    return res.status(200).json(user.wallet);
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: 'Falha ao consultar a carteira.' });
  }
}

exports.getWalletValue = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId, "-password");

    const totalWallet = user.wallet.reduce((acc, asset) => {
      return acc + asset.total;
    }, 0);

    return res.status(200).json(totalWallet);
  } catch (e) {
    console.log(e);

    res.status(500).send({ message: 'Falha ao consultar o valor total da carteira em USD.' });
  }
}