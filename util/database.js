// const mongodb = require("mongodb");
// const MongoClient = mongodb.MongoClient;

// let _db;

// const mongoConnect = (callback) => {
//    MongoClient.connect(
//       "mongodb+srv://siddhesh-shirawale:PkLk9xzBPdxX3YJs@cluster0.p3ip8.mongodb.net/shopdb?retryWrites=true&w=majority",
//       { useNewUrlParser: true, useUnifiedTopology: true }
//    )
//       .then((client) => {
//          console.log("Connected");
//          _db = client.db();
//          callback(client);
//       })
//       .catch((err) => {
//          console.log(err);
//          throw err;
//       });
// };

// const getDb = () => {
//    if (_db) {
//       return _db;
//    }
//    throw "No database found!";
// };

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;
