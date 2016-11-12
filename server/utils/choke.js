const taken = {};

export function choke(resourceId, args) {
  return new Promise((resolve) => {
    const check = () => {
      if (taken[resourceId]) {
        global.setTimeout(check, 10);
      } else {
        taken[resourceId] = true;
        resolve(args);
      }
    };
    check();
  });
}

export function releaseChoke(resourceId, args) {
  delete taken[resourceId];
  return args;
}
