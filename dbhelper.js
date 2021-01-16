const sqlite3 = require('sqlite3')
const Promise = require('bluebird')
var sqlite = require('sqlite-cipher');

class AppDAO {
  constructor(dbFilePath) {
    // sqlite.encrypt(dbFilePath,"reencrypted.db", "POS@123","aes-256-ctr");
    this.db = sqlite.connect('reencrypted.enc','POS@123','aes-256-ctr');
    // console.log(this.db.run("SELECT id FROM invoice;"));

    // this.db = new sqlite3.Database(dbFilePath, (err) => {
    //   if (err) {
    //     console.log('Could not connect to database', err)
    //   } else {
    //     console.log('Connected to database')
    //   }
    // })
  }
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      var data = this.db.run(sql)
      if (data) {
        console.log(data)
        resolve(data)
      } else {
        reject(rows)
      }
    })
  }
  
  // get(sql, params = []) {
  //   return new Promise((resolve, reject) => {
  //     var data = this.db.run(sql)
  //     if (data) {
  //       console.log(data)
  //       resolve(data)
  //     } else {
  //       reject(rows)
  //     }
  //   })
  // }

  // all(sql, params = []) {
  //   return new Promise((resolve, reject) => {
  //     var data = this.db.run(sql);
  //     if (data) {
  //       console.log(data)
  //       resolve(data)
  //     } else {
  //       reject(rows)
  //     }
  //   })
  // }
}

module.exports = AppDAO