const mongooose = require("mongoose");

const userSchema = new mongooose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
  root: [
    {
      path: { type: String },
      exp: { type: Number },
    },
  ],
});

const User = mongooose.model("USER", userSchema);

module.exports = User;
