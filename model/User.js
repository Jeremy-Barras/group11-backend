"strict mode";
const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "145OkyayNo668Pass";
const FILE_PATH = __dirname + "/users.json";

//Rajout de 3 variables pour retenir le score
class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.bestScoreEasy = 0;
    this.bestScoreMedium = 0;
    this.bestScoreHard = 0;
  }

  /* return a promise with async / await */ 
  async save() {
    let userList = getUserListFromFile(FILE_PATH);
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    console.log("save:", this.email);
    userList.push({
      username: this.username,
      email: this.email,
      password: hashedPassword,
      bestScoreEasy: this.bestScoreEasy,
      bestScoreMedium: this.bestScoreMedium,
      bestScoreHard: this.bestScoreHard,
    });
    saveUserListToFile(FILE_PATH, userList);
    return true;
  }

  /* return a promise with classic promise syntax*/
  checkCredentials(email, password) {
    if (!email || !password) return false;
    let userFound = User.getUserFromList(email);
    console.log("User::checkCredentials:", userFound, " password:", password);
    if (!userFound) return Promise.resolve(false);
    //try {
    console.log("checkCredentials:prior to await");
    // return the promise
    return bcrypt
      .compare(password, userFound.password)
      .then((match) => match)
      .catch((err) => err);
  }

  static get list() {
    let userList = getUserListFromFile(FILE_PATH);
    return userList;
  }

  static isUser(username) {
    const userFound = User.getUserFromList(username);
    console.log("User::isUser:", userFound);
    return userFound !== undefined;
  }

  static getUserFromList(email) {
    const userList = getUserListFromFile(FILE_PATH);
    for (let index = 0; index < userList.length; index++) {
      if (userList[index].email === email) return userList[index];
    }
    return;
  }

  //Fonction qui permet de recuperer le bestScore d'un utilisateur en fonction du mode de difficulté
  getBestScore(email,difficulty) {
    const userList = getUserListFromFile(FILE_PATH);
    for (let index = 0; index < userList.length; index++) {
      if (userList[index].email === email){
        if(difficulty == "Easy") return userList[index].bestScoreEasy;
        if(difficulty == "Medium") return userList[index].bestScoreMedium;
        return userList[index].bestScoreHard;
      } 
    }
    return;
  }

  //Fonction qui permet de changer le bestScore d'un utilisateur en fonction du mode de difficulté
  static update(email, nvBestScore, difficulty) {
    let userList = getUserListFromFile(FILE_PATH);
    let index = userList.findIndex((user) => user.email == email);
    if (index < 0) return;
    if(difficulty === "Easy") userList[index].bestScoreEasy = nvBestScore;
    if(difficulty === "Medium") userList[index].bestScoreMedium = nvBestScore;
    if(difficulty === "Hard") userList[index].bestScoreHard = nvBestScore;
    saveUserListToFile(FILE_PATH, userList);
    return;
  }

}

function getUserListFromFile(filePath) {
  const fs = require("fs");
  if (!fs.existsSync(filePath)) return [];
  let userListRawData = fs.readFileSync(filePath);
  let userList;
  if (userListRawData) userList = JSON.parse(userListRawData);
  else userList = [];
  return userList;
}

function saveUserListToFile(filePath, userList) {
  const fs = require("fs");
  let data = JSON.stringify(userList);
  fs.writeFileSync(filePath, data);
}

module.exports = User;
