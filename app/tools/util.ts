const configFile = '/config/config.json';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as child_process from 'child_process';
import * as shellEscape from 'shell-escape';
import { Logs } from './logging';
import { Config } from './config.model';

export default class Util {
  private static _instance: Util = new Util();

  public config: Config = new Config();

  constructor() {
    if (Util._instance) {
      throw new Error('Error: Instantiation failed: Use Util.getInstance() instead of new');
    }
    Util._instance = this;
  }

  public static getInstance(): Util {
    return Util._instance;
  }

  public copyFromSourceToDestination(sourceItemPath: string, destinationFolder: string): void {
    if (fs.statSync(sourceItemPath).isDirectory()) {
      const subFiles = fs.readdirSync(sourceItemPath);
      for (let i = 0; i < subFiles.length; i++) {
        this.copyFromSourceToDestination(`${sourceItemPath}/${subFiles[i]}`, destinationFolder);
      }

      const newSubFiles = fs.readdirSync(sourceItemPath);
      if (newSubFiles.length === 0) {
        fs.rmdirSync(`./${sourceItemPath}`);
      }
    } else {
      fs.moveSync(`./${sourceItemPath}`, `${destinationFolder}/${sourceItemPath}`, { overwrite: true });
    }
  }

  public copyToNewDirectory(sourceItemPath: string, destinationFolder: string) {
    if (sourceItemPath) {
      const isDirectory = fs.statSync(sourceItemPath).isDirectory();
      if (isDirectory) {
        const files = fs.readdirSync(sourceItemPath);
        for (let i = 0; i < files.length; i++) {
          this.copyFromSourceToDestination(`${sourceItemPath}/${files[i]}`, destinationFolder);
        }
        if (this.isDirectoryEmpty(sourceItemPath)) {
          fs.rmdirSync(`${sourceItemPath}`);
        }
      } else {
        this.copyFromSourceToDestination(sourceItemPath, destinationFolder);
      }
    }
  }

  public doesPathExist(itemPath: string) {
    try {
      fs.accessSync(itemPath);
    } catch (e) {
      return false;
    }
    return true;
  }

  private isDirectoryEmpty(dirPath: string) {
    const subFiles = fs.readdirSync(dirPath);
    if (!subFiles.length) {
      return true;
    }
  }

  private renameTVFile(sourceItemPath: string) {
    const isDirectory = fs.statSync(sourceItemPath).isDirectory();
    if (isDirectory) {
      const subFiles = fs.readdirSync(sourceItemPath);
      for (let i = 0; i < subFiles.length; i++) {
        this.renameTVFile(fs.realpathSync(`${sourceItemPath}/${subFiles[i]}`));
      }
    }

    let tempName = path.basename(sourceItemPath);
    let validFileExt = false;
    let fileExt = '';

    if (fs.statSync(sourceItemPath).isFile()) {
      fileExt = path.extname(tempName);
      tempName = path.parse(path.basename(sourceItemPath)).name;
      validFileExt = fileExt.match(/^\.(mp4|mkv|avi|srt|idx|sub|ass)$/gi) == null ? false : true;
      fileExt.replace(/^\.m4v$/gi, '.mp4');
    }

    let foundMatch = false;

    tempName = this.preCleanUpFileName(tempName);

    const movieCurrentYearMatch = this.movieYearMatch(tempName);

    const tvDateEpisodeMatch = this.tvDateMatch(tempName);
    if (tvDateEpisodeMatch != null && foundMatch === false) {
      if (tempName.substring(tvDateEpisodeMatch.index).match(/sample/gi) === null) {
        tempName = tempName.substr(0, tvDateEpisodeMatch.index + tvDateEpisodeMatch[0].length);
        tempName = this.postCleanUpFileName(tempName);
        foundMatch = true;
      }
    }

    const tvRegularMatch = this.tvRegularMatch(tempName);
    if (tvRegularMatch != null && foundMatch === false) {
      if (tempName.substring(tvRegularMatch.index).match(/sample/gi) == null) {
        tempName = tempName.substr(0, tvRegularMatch.index) + tvRegularMatch[0].replace(/s/g, 'S').replace(/e/g, 'E').replace(/\-/g, '');
        tempName = this.postCleanUpFileName(tempName);
        foundMatch = true;
      }
    }

    const tvXSeasonMatch = this.tvXSeasonMatch(tempName);
    if (tvXSeasonMatch != null && foundMatch === false) {
      if (tempName.substring(tvXSeasonMatch.index).match(/sample/gi) == null) {
        const matchString = tvXSeasonMatch[0];
        let leftString = matchString.split('x')[0];
        let rightString = matchString.split('x')[1];
        leftString = 'S' + (leftString.length === 1 ? '0' + leftString : leftString);
        rightString = 'E' + (rightString.length === 1 ? '0' + rightString : rightString);

        tempName = tempName.substr(0, tvXSeasonMatch.index) + leftString + rightString;
        tempName = this.postCleanUpFileName(tempName);
        foundMatch = true;
      }
    }

    if (foundMatch) {
      if (validFileExt) {
        fs.renameSync(sourceItemPath, `${path.dirname(sourceItemPath)}/${tempName}${fileExt}`);
      } else if (isDirectory) {
        fs.renameSync(sourceItemPath, `${path.dirname(sourceItemPath)}/${tempName}`);
      }
    }
  }

  public renameTVFiles(sourceItemPath) {
    if (sourceItemPath) {
      const isDirectory = fs.statSync(sourceItemPath);
      if (isDirectory) {
        this.findFilesToExtract(sourceItemPath);
        const files = fs.readdirSync(sourceItemPath);
        for (let i = 0; i < files.length; i++) {
          this.renameTVFile(`${sourceItemPath}/${files[i]}`);
        }
      } else {
        this.renameTVFile(sourceItemPath);
      }
    }
  }

  private toTitleCase(e) {
    e = e.replace(/\./g, ' ');
    const t = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via|with)$/i;
    return e.replace(/([^\W_]+[^\s-]*) */g, function(p, n, r, i) {
      return r > 0 && r + n.length !== i.length && n.search(t) > -1 && i.charAt(r - 2) !== ':' && i.charAt(r - 1).search(/[^\s-]/) < 0
        ? p.toLowerCase()
        : n.substr(1).search(/[A-Z]|\../) > -1
          ? p
          : p.charAt(0).toUpperCase() + p.substr(1);
    });
  }

  private preCleanUpFileName(fileName) {
    fileName = this.toTitleCase(fileName);
    fileName = fileName.replace(/\_/g, '.');
    fileName = fileName.replace(/ /g, '.');
    return fileName;
  }

  private postCleanUpFileName(fileName) {
    fileName = fileName.replace(/\.-\./g, '.');
    fileName = fileName.replace(/\.{2,}/g, '.');
    fileName = fileName.replace(/\(/g, '');
    fileName = fileName.replace(/\)/g, '');
    fileName = fileName.replace(/\,/g, '');
    fileName = fileName.replace(/\&/g, 'and');
    fileName = fileName.replace(/\'/g, '');
    const renames = JSON.parse(fs.readFileSync('/config/renames.json', 'utf8'));
    for (let i = 0; i < renames.data.length; i++) {
      fileName = fileName.replace(new RegExp(renames.data[i].pattern, 'gi'), renames.data[i].rename);
    }
    return fileName;
  }

  private tvDateMatch(fileName) {
    const dateMatch = /\d{4,4}\.\d{2,2}\.\d{2,2}/;
    return dateMatch.exec(fileName);
  }

  private tvRegularMatch(fileName) {
    const seasonMatch = /(s\d{2}e\d{2})((?:\-e\d{2})+|(?:e\d{2})+)?/gi;
    return seasonMatch.exec(fileName);
  }

  private tvShortMatch(fileName) {
    const shortSeasonMatch = /\d{3,4}/;
    return shortSeasonMatch.exec(fileName);
  }

  private tvXSeasonMatch(fileName) {
    const xSeasonMatch = /\d{1,2}x\d{1,3}/;
    return xSeasonMatch.exec(fileName);
  }

  private movieYearMatch(fileName) {
    const yearMatch = /(19|20)\d{2,2}/;
    return yearMatch.exec(fileName);
  }

  private restructureTVFile(sourceItemPath, rootPath) {
    const isDirectory = fs.statSync(sourceItemPath).isDirectory();
    if (isDirectory) {
      if (sourceItemPath.indexOf('Ω') === -1) {
        const subFiles = fs.readdirSync(sourceItemPath);
        for (let i = 0; i < subFiles.length; i++) {
          this.restructureTVFile(`${fs.realpathSync(sourceItemPath)}/${subFiles[i]}`, rootPath);
        }
        fs.rmdirSync(sourceItemPath);
      }
    } else if (fs.statSync(sourceItemPath).isFile()) {
      let validFileExt = false;
      let fileExt = '';
      const fileName = path.parse(path.basename(sourceItemPath)).name;
      const notSampleFile = fileName.match(/sample/gi);
      let foundMatch = false;

      fileExt = path.extname(sourceItemPath);
      validFileExt = fileExt.match(/^\.(m4v|mp4|mkv|avi|srt|idx|sub|ass)$/gi) == null ? false : true;

      if (validFileExt) {
        const tvDateEpisodeMatch = this.tvDateMatch(fileName);
        const tvRegularMatch = this.tvRegularMatch(fileName);

        if (tvDateEpisodeMatch != null && foundMatch === false) {
          if (fileName.substring(tvDateEpisodeMatch.index).match(/sample/gi) == null) {
            this.createIfMissingDirectory(`${rootPath}/${fileName.substr(0, tvDateEpisodeMatch.index - 1)}`);
            this.createIfMissingDirectory(`${rootPath}/${fileName.substr(0, tvDateEpisodeMatch.index - 1)}/${tvDateEpisodeMatch[0].substr(0, 4)}`);
            fs.renameSync(sourceItemPath, `${rootPath}/${fileName.substr(0, tvDateEpisodeMatch.index - 1)}/${tvDateEpisodeMatch[0].substr(0, 4)}/${fileName}${fileExt}`);
            foundMatch = true;
          }
        }
        if (tvRegularMatch != null && foundMatch === false) {
          if (fileName.substring(tvRegularMatch.index).match(/sample/gi) == null) {
            this.createIfMissingDirectory(`${rootPath}/${fileName.substr(0, tvRegularMatch.index - 1)}`);
            this.createIfMissingDirectory(`${rootPath}/${fileName.substr(0, tvRegularMatch.index - 1)}/Season.${tvRegularMatch[0].substr(1, 2)}`);
            fs.renameSync(sourceItemPath, `${rootPath}/${fileName.substr(0, tvRegularMatch.index - 1)}/Season.${tvRegularMatch[0].substr(1, 2)}/${fileName}${fileExt}`);
            foundMatch = true;
          }
        }
        if (!foundMatch) {
          fs.unlinkSync(sourceItemPath);
        }
      } else {
        fs.unlinkSync(sourceItemPath);
      }
    }
  }

  public restructureTVFiles(sourceItemPath) {
    if (sourceItemPath) {
      const files = fs.readdirSync(sourceItemPath);
      for (let i = 0; i < files.length; i++) {
        this.restructureTVFile(`${sourceItemPath}/${files[i]}`, sourceItemPath);
      }
    }
  }

  private createIfMissingDirectory(dir: string) {
    if (!fs.existsSync(dir)) {
      console.log('Directory to make: ' + dir);
      fs.mkdirSync(dir);
    }
  }

  private copyToTVDestination(sourceItemPath: string) {
    if (fs.statSync(sourceItemPath).isDirectory()) {
      const subFiles = fs.readdirSync(sourceItemPath);
      for (let i = 0; i < subFiles.length; i++) {
        this.copyToTVDestination(`${sourceItemPath}/${subFiles[i]}`);
      }

      const newSubFiles = fs.readdirSync(sourceItemPath);
      if (newSubFiles.length === 0) {
        fs.rmdirSync('./' + sourceItemPath);
      }
    } else {
      const finalDirectory = sourceItemPath
        .split('/')
        .filter((pathPart: string, pathIndex: number) => pathIndex !== 0 && pathIndex !== 1)
        .join('/');
      fs.moveSync(`./${sourceItemPath}`, `${this.config.props.tvShowsDestination}/${finalDirectory}`, { overwrite: true });
    }
  }

  private tvDestinationHasShow(showName: string) {
    return this.doesPathExist(`${this.config.props.tvShowsDestination}/${showName}`);
  }

  public copyAllToTVDestination(sourceItemPath: string) {
    let showDirectoryExists = true;
    if (this.config.props.tvShowsDestination) {
      if (sourceItemPath) {
        const isDirectory = fs.statSync(sourceItemPath).isDirectory();
        if (isDirectory) {
          const files = fs.readdirSync(sourceItemPath);
          for (let i = 0; i < files.length; i++) {
            if (this.tvDestinationHasShow(files[i])) {
              this.copyToTVDestination(`${sourceItemPath}/${files[i]}`);
            } else {
              Logs.writeMessage(`Can't find show name in tv directory ${files[i]} so no copy will occur`);
              showDirectoryExists = false;
            }
          }
          if (showDirectoryExists) {
            fs.rmdirSync(sourceItemPath);
          }
        }
      }
    }
  }

  private findFilesToExtract(itemPath: string) {
    if (fs.statSync(itemPath).isDirectory()) {
      const files = fs.readdirSync(itemPath);
      for (let i = 0; i < files.length; i++) {
        this.findFilesToExtract(itemPath + '/' + files[i]);
      }
    } else if (fs.statSync(itemPath).isFile()) {
      if (itemPath.substr(itemPath.length - 3) === 'rar') {
        let shouldProcess = false;
        if (itemPath.match(/part\d{1,}\.rar/gi) != null) {
          if (itemPath.match(/part(0{1,})?1\.rar/gi) != null) {
            shouldProcess = true;
          }
        } else {
          shouldProcess = true;
        }
        if (shouldProcess) {
          child_process.execSync(`7z e "${fs.realpathSync(itemPath)}" "-o${path.dirname(path.resolve(itemPath))}" -aoa`);
        }
      }
    }
  }
}
