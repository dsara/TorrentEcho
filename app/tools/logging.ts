export namespace Logs {
  export function writeMessage(message: string, callback?: Function, isEnd?: boolean) {
    console.log((new Date().toLocaleString()) + ' - ' + message.toString());
    if (callback) {
      callback(message, isEnd);
    }
  }

  export function writeError(message: string, callback?: Function, isEnd?: boolean) {
    console.log((new Date().toLocaleString()) + ' - ERROR: ' + message.toString());
    if (callback) {
      callback(message, isEnd);
    }
  }
}
