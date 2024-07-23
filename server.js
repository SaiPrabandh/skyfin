const express = require("express");
const path = require("path");
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase-admin/auth');
const bodyParser = require('body-parser');
const session = require('express-session');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./key.json');
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

// Firebase Initialization
initializeApp({
  credential: cert(serviceAccount)
});
const auth = getAuth();
const db = getFirestore();

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

app.get('/post-work', (req, res) => {
  res.render('post-work');
});

app.get('/chatbot', (req, res) => {
  res.render('chatbot');
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

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      uid: user.uid,
      email: email,
      firstname: firstname,
      lastname: lastname,
      phone: phone,
      skills: skills,
      resume: resume,
      ca_certificate: ca_certificate
    };

    await db.collection('freelancers').doc(user.uid).set(userData);

    res.send("Sign up is successful. Go to <a href='/login'>login</a>.");
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(500).send("Error: Unable to sign up. Please try again later.");
  }
});

app.post("/signupHiringSubmit", async (req, res) => {
  const { email, password, fullname, company, phone, location } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      uid: user.uid,
      email: email,
      fullname: fullname,
      company: company,
      phone: phone,
      location: location
    };

    await db.collection('hirers').doc(user.uid).set(userData);

    res.send("Sign up is successful. Go to <a href='/login'>login</a>.");
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(500).send("Error: Unable to sign up. Please try again later.");
  }
});

app.post("/loginSubmit", async (req, res) => {
  const { email, password } = req.body;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Successful login, redirect to dashboard or other pages
    res.render("dashboard");
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(401).send("Invalid email or password");
  }
});

app.get("/home", (req, res) => {
  if (req.session.user) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
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
