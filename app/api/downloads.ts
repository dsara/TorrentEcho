import { Router, Request, Response } from 'express';

const router: Router = Router();

router.post('/download/:label', (req: Request, res: Response) => {
  const label = req.params.label;
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  
});

export const DownloadsController: Router = router;

// app.post("/download/:label", function (req, res) {
//   var label = req.params.label;
//   res.writeHead(200, {'Content-Type': 'text/plain'});

//   try {
//     var syncer = new sync(config);

//     var callback = function(message, end) {
//       if (end) {
//         res.end(message);
//       } else {
//         res.write(message + " \n");
//       }
//     }

//     if (label in config.labelDownloadFolders) {
//       //  call sync passing in config for the label
//       syncer.sync(label, config.rootDownloadFolder + config.labelDownloadFolders[label], config.doneLabel, callback);
//     } else {
//       res.end("Label '" + label + "' not found in configuration");
//     }

//   } catch (error) {
//     res.end(error);
//   }
// });

// // Endpoint for procesing a folder sync
// app.post("/sync/:label", function(req, res) {
//   var label = req.params.label;
//   res.writeHead(200, {'Content-Type': 'text/plain'});

//   try {

//     if (label in config.syncFolders) {
//       // Setup some default options... need to clean this up at some point.
//       var additionalCommands = "set mirror:use-pget-n " + config.pget + ";set pget:default-n " + config.pget + ";set xfer:use-temp-file true;set xfer:temp-file-name *.tmp";

//       ftps = new FTPS({
//         host: config.host,
//         username: config.user,
//         password: config.pass,
//         protocol: 'sftp',
//         autoConfirm: true,
//         additionalLftpCommands: additionalCommands
//       });

//       var mirrorCommand = ftps.mirrorTorrent(config.syncFolders[label].source, config.syncFolders[label].destination, config.syncRemoveSource);
//       logs.writeMessage("Wrote lftp command: " + mirrorCommand);

//       //  call sync passing in config for the label
//       ftps.exec(function(error, data) {
//         if (error) {
//           logs.writeMessage(error + " " + data.erroror + " " + data.data);
//         } else {
//           logs.writeMessage("LFTP Response: " + data.data);
//         }
//       });

//       res.end("Download Started");
//     } else {
//       res.end("Sync Label '" + label + "' not found in configuration");
//     }

//   } catch (error) {
//     res.end("errorOR: " + error);
//   }
// });