const failRequest = message => Promise.reject({
  code: 400,
  message: `Bad Request: ${message}`,
});

const testIdTracks = /^\d+(,\d+)*$/;
const testInteger = /^\d+$/;

export function keyIsInteger(key) {
  return (o) => {
    const id = o.keys[key];
    return (
      id && !testInteger.test(id)
      ? failRequest(`${key} should be an integer`)
      : o
    );
  };
}

export function keyIsIntegerList(key) {
  return (o) => {
    const id = o.keys[key];
    return (
      id && !testIdTracks.test(id)
      ? failRequest(`${key} should be a comma-separated list of integers`)
      : o
    );
  };
}
