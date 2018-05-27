import { Router, Request, Response } from 'express';
import { Sync } from '../lib/sync';
import utilities from '../tools/util';
const util = utilities.getInstance();

const router: Router = Router();

router.post('/download/:label', (req: Request, res: Response) => {
  const label = req.params.label;
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  try {
    const syncer = new Sync();

    const callback = (message, end) => {
      if (end) {
        res.end(message);
      } else {
        res.write(message + ' \n');
      }
    };

    if (label in util.config.props.labelDownloadFolders) {
      syncer.sync(label,
        util.config.props.rootDownloadFolder + util.config.props.labelDownloadFolders[label],
        util.config.props.doneLabel,
        callback);
    } else {
      res.end(`Label '${label}' not found in configuration`);
    }
  } catch (err) {
    res.end(err);
  }
});

export const DownloadsController: Router = router;
