const url = require('url');
const { getPdf } = require('./chromium');

const allowedDomains = (process.env.ALLOWED_DOMAINS || '').split(',');

module.exports = async function (req, res) {
  let body = '';

  if (req.method === 'OPTIONS') {
    const corsReqHeaders = req.headers['access-control-request-headers'];
    
    if (corsReqHeaders) {
      res.setHeader('access-control-allow-headers', corsReqHeaders);
    }

    return res.end();
  } else if (req.method !== 'POST') {
    res.statusCode = 404;
    return res.end();
  }

  req.on('data', function (data) {
    body += data;

    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6)
      req.connection.destroy();
  });

  req.on('end', async function () {
    const post = JSON.parse(body);

    if (!post.url) {
      res.statusCode = 400;
      res.end(`url missing in body`);
      return;
    }

    const { host } = url.parse(post.url);
    if (!allowedDomains.find(domain => host.match(new RegExp(domain)))) {
      res.statusCode = 400;
      res.end(`urls from host '${host} is not allowed for this service`);
      return;
    }

    // Check that either none or both of localStorageData and localStorageKey is present in body
    if (post.localStorageData ? !post.localStorageKey : post.localStorageKey) {
      res.statusCode = 400;
      res.end(`you can't have one of localStorageData and localStorageKey in body. Both or none is expected`);
      return;
    }

    try {
      const file = await getPdf(post.url, post);
      res.statusCode = 200;
      res.setHeader('Content-Type', `application/pdf`);
      res.end(file);
    } catch (e) {
      console.error(e.message);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html');
      res.end(`<h1>Server Error</h1><p>Sorry, there was a problem</p>`);
    }
  });
}
