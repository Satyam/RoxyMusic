export default (html, initialState) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Sample Web Page</title>
    <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
    <link rel="stylesheet" href="/bootstrap/css/bootstrap-theme.min.css" />
    <link rel="stylesheet" href="/bundles/webClient.css" />
    <script id="initialState" type="application/json">${initialState}</script>
  </head>
  <body>
    <div id="contents" class="container-fluid">${html}</div>
    <script src="/bundles/webClient.js"></script>
  </body>
</html>
`;
