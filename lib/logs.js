module.exports = class Logs {
  constructor() { }

  static writeMessage(message, callback, isEnd) {
    console.log((new Date().toLocaleString()) + " - " + message.toString());
    if (callback) {
      callback(message, isEnd);
    }
  }

  static writeError(message, callback, isEnd) {
    console.log((new Date().toLocaleString()) + " - ERROR: " + message.toString());
    if (callback) {
      callback(message, isEnd);
    }
  }
}