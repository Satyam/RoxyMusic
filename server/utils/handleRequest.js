import debug from 'debug';

// debug.enable('RoxyMusic:handleRequest');
const log = debug('RoxyMusic:handleRequest');

export default (...args) => (req, res) => {
  const o = {
    keys: req.params || {},
    data: req.body,
    options: req.query || {},
  };

  log('> %s %j', req.url, o);

  return args.reduce(
    (p, next) => p.then(next),
    Promise.resolve(o)
  )
  .then((reply) => {
    log('< %s %j', req.url, reply);
    return res.json(reply);
  })
  .catch((reason) => {
    res.status((reason instanceof Error) ? 500 : reason.code).send(reason.message);
  });
};
