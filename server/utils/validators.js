export class ValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
  toString() {
    return `${this.name}: [${this.code}] ${this.message}`;
  }
}

const validationFail = message => Promise.reject(new ValidationError(400, message));

const testIdTracks = /^\d+(,\d+)*$/;
const testInteger = /^\d+$/;

export function keyIsInteger(key) {
  return (o) => {
    const id = o.keys[key];
    return (
      id && !testInteger.test(id)
      ? validationFail(`${key} should be an integer`)
      : o
    );
  };
}

export function keyIsIntegerList(key) {
  return (o) => {
    const id = o.keys[key];
    return (
      id && !testIdTracks.test(id)
      ? validationFail(`${key} should be a comma-separated list of integers`)
      : o
    );
  };
}
