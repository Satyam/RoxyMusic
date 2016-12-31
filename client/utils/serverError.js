export default class ServerError extends Error {
  constructor(code, message, method = '', url = '') {
    super(message);
    this.name = 'ServerError';
    this.code = code;
    this.method = method.toUpperCase();
    this.url = url;
  }
  toString() {
    return `${this.name}: [${this.code}] ${this.message} requesting ${this.method} on ${this.url}`;
  }
}
