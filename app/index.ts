import * as http from 'http';
import * as express from 'express';
import * as fs from 'fs';
import { DownloadsController } from './api/downloads';
import { Logs } from './tools/logging';
import utilities from './tools/util';
const util = utilities.getInstance();

process.chdir(util.config.props.nodeDownloadFolder);

const app: express.Application = express();

const port = 8080;

app.use(function (request, response, next) {
  try {
    // log the request on console
    Logs.writeMessage(request.url);
    next();
  } catch (error) {
    Logs.writeMessage(error);
  }
});

app.use('/', DownloadsController);

app.listen(port, () => {
  Logs.writeMessage(`Server listening on: http://localhost:${port}/`);
});
