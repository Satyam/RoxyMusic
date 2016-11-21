import debug from 'debug';

export const failRequest = (code, message) => Promise.reject({ code, message });

// debug.enable('RoxyMusic:handleRequest');
const log = debug('RoxyMusic:handleRequest');

export const handleRequest = (...args) => (req, res) => {
  const o = {
    keys: req.params || {},
    data: req.body,
    options: req.query || {},
  };

  log('> %s %j', req.url, o);
  const action = args[args.length - 1];
  Promise.all(args.slice(0, -1).map(validator => validator(o)))
  .then(() => action(o))
  .then((reply) => {
    log('< %s %j', req.url, reply);
    return res.json(reply);
  })
  .catch((reason) => {
    res.status((reason instanceof Error) ? 500 : reason.code).send(reason.message);
  });
};
