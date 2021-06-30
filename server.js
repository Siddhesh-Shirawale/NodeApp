const path = require("path");
require("dotenv").config();
const fs = require("fs");
const https = require("https");

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.p3ip8.mongodb.net/${process.env.MONGO_DEFAULT_DB}?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDbStore({
   uri: MONGODB_URI,
   collection: "sessions",
   // expires
});
const csrfProtection = csrf();

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

// Multer :
const fileStorage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "images");
   },
   filename: (req, file, cb) => {
      cb(null, uuidv4() + "-" + file.originalname);
   },
});

const fileFilter = (req, file, cb) => {
   if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
   ) {
      cb(null, true);
   } else {
      cb(null, false);
   }
};
//////

// set view engine and path of folder
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const accessLogStream = fs.createWriteStream(
   path.join(__dirname, "access.log"),
   { flags: "a" }
);
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.urlencoded({ extended: false }));
app.use(
   multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images"))); // FOR MULTER
app.use(
   session({
      secret: "mySessionSecret",
      resave: false,
      saveUninitialized: false,
      store: store,
   })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
   res.locals.isAuthenticated = req.session.isLoggedIn;
   res.locals.csrfToken = req.csrfToken();
   next();
});

app.use((req, res, next) => {
   // throw new Error("sync dummy outside"); // testing error handling
   if (!req.session.user) {
      return next();
   }
   User.findById(req.session.user._id)
      .then((user) => {
         // throw new Error("dummy"); //testing error handling // async
         if (!user) {
            return next();
         }
         req.user = user;
         next();
      })
      .catch((err) => {
         next(new Error(err));
      });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
   // console.log(error);
   // res.status(error.httpStatusCode).render(...);
   // res.redirect("/500");
   res.status(500).render("500", {
      pageTitle: "Error",
      path: "/500",
      isAuthenticated: req.session.isLoggedIn,
   });
});

mongoose
   .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
   .then((result) => {
      // https
      //    .createServer({ key: privatekey, cert: certificate }, app)
      //    .listen(process.env.PORT || 5000);
      app.listen(process.env.PORT || 5000);
   })
   .catch((err) => {
      console.log(err);
   });
