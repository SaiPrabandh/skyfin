const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true in production with HTTPS
}));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Define routes
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/hirefreelancer', (req, res) => {
  res.render('hirefreelancer');
});

app.get('/post_work', (req, res) => {
  res.render('post_work');
});

app.get('/customersup', (req, res) => {
  res.render('customersup');
});
app.get('/payment-faq', (req, res) => {
  res.render('payment-faq');
});
app.get('/faq', (req, res) => {
  res.render('faq');
});
app.get('/project-posting-faq', (req, res) => {
  res.render('project-posting-faq');
});


app.get('/profile', (req, res) => {
  res.render('profile');
});

app.get('/chating', (req, res) => {
  res.render('chating');
});

app.get('/mypayments', (req, res) => {
  res.render('mypayments');
});

app.get('/subscription', (req, res) => {
  res.render('subscription');
});

app.get('/myreviews', (req, res) => {
  res.render('myreviews');
});

app.get("/signup", (req, res) => {
  res.render("new_user", {
    workSignupUrl: "/signupWork",
    hiringSignupUrl: "/signupHiring"
  });
});

app.get("/signupWork", (req, res) => {
  res.render("signup_work", { signupAction: "/signupWorkSubmit" });
});

app.get("/signupHiring", (req, res) => {
  res.render("signup_hiring", { signupAction: "/signupHiringSubmit" });
});

app.get("/login", (req, res) => {
  res.render("login", {
    loginAction: "/loginSubmit",
    forgotPasswordUrl: "/forgot-password",
    newUserUrl: "/signup"
  });
});

app.post("/signupWorkSubmit", upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'ca_certificate', maxCount: 1 }]), async (req, res) => {
  const { email, password, firstname, lastname, phone, skills } = req.body;
  const resume = req.files['resume'][0].path;
  const ca_certificate = req.files['ca_certificate'][0].path;

  // Replace this section with your own user creation and database storage logic
  // For example, using a custom user management system or a different database
  
  res.send("Sign up is successful. Go to <a href='/login'>login</a>.");
});

app.post("/signupHiringSubmit", async (req, res) => {
  const { email, password, fullname, company, phone, location } = req.body;

  // Replace this section with your own user creation and database storage logic
  // For example, using a custom user management system or a different database

  res.send("Sign up is successful. Go to <a href='/login'>login</a>.");
});

app.post("/loginSubmit", async (req, res) => {
  const { email, password } = req.body;

  // Replace this section with your own user authentication logic
  // For example, using a custom user management system or a different database

  res.render("home");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error: Unable to log out. Please try again later.");
    }
    res.redirect("/login");
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
