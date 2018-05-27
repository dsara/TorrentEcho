import * as http from 'http';
import * as express from 'express';
import * as fs from 'fs';
import { DownloadsController } from './api/downloads';
import logging from './tools/logging';
import utilities from './tools/util';

const logs = logging.getInstance();
const util = utilities.getInstance();

process.chdir(util.config.props.nodeDownloadFolder);

const app: express.Application = express();

const port = util.config.props.port;

app.use('/', DownloadsController);

app.listen(port, () => {
  this.logs.writeMessage(`Server listening on: http://localhost:${port}/`);
});
