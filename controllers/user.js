const Listing = require("../models/listing");
const User = require("../models/user");

module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { name, username, email, password } = req.body;
    const newUser = new User({ name, email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      return res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Logged in successfully");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  delete req.session.redirectUrl;
  return res.redirect(redirectUrl);
};

module.exports.profileGet = async (req, res) => {
  if (!req.user) {
    req.flash("error", "Please login first");
    return res.redirect("/login");
  }
  const user = await User.findById(req.user._id);
  const listing = await Listing.find({ owner: req.user._id });

  res.render("users/profile.ejs", { user, listing });
};

module.exports.profileUpdate = async (req, res) => {
  let updateduser = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...req.body.user,
    },
    { new: true },
  );

  req.login(updateduser, (err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Profile upadated successfully");
    res.redirect("/profile");
  });
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You logged out successfully!");
    res.redirect("/listings");
  });
};
