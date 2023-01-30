const {
  registration,
  registrationResend,
  verification,
  login,
  logout,
  current,
} = require("../services/authService");

const registrationController = async (req, res) => {
  const { email, password } = req.body;
  const user = await registration(email, password);
  res.status(201).json({
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const registrationResendController = async (req, res) => {
  const { email } = req.body;
  await registrationResend(email);
  res.json(`New verification link was sent to ${email}`);
};

const verificationController = async (req, res) => {
  const { verificationToken } = req.params;

  await verification(verificationToken);

  res.json({ status: "User verified" });
};

const loginController = async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await login(email, password);
  res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logoutController = async (req, res) => {
  const userId = req.user._id;
  await logout(userId);
  res.sendStatus(204);
};

const currentController = async (req, res) => {
  const userId = req.user._id;
  const user = await current(userId);
  res.status(200).json({
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

module.exports = {
  registrationController,
  registrationResendController,
  loginController,
  logoutController,
  currentController,
  verificationController,
};
