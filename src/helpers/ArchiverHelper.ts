import {Service} from 'typedi';
import fs from 'fs';
import archiver from 'archiver';
import {ArchiverException} from '../exceptions';
import Helper from './Helper';

@Service()
export default class ArchiverHelper extends Helper{

  /**
   *
   * @param file
   * @param name
   */
  async compress(file: string, name: string): Promise<void> {
    const output = fs.createWriteStream('example.tar.gz');
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: {
        level: 1
      }
    });

    archive.pipe(output);
    archive.append(fs.createReadStream(file), { name });
    await archive.finalize();
    await this.compressCheckListeners(archive, output);
    // console.log(archive.pointer() + ' total bytes.');
  }

  /**
   *
   * @param archive
   * @param output
   */
  async compressCheckListeners(archive: archiver.Archiver, output: fs.WriteStream): Promise<boolean> {
    const self = this;
    return new Promise((resolve,reject) => {
      output.on('close', function() {
        self.logs.push(archive.pointer() + ' total bytes.');
        self.logs.push('archiver has been finalized and the output file  has closed.');
        self.checkList('s', 'compress');
        resolve(true);
      });

      archive.on('error', function(e) {
        self.logs.push(e.message);
        self.checkList('e', 'compress');
        reject(new ArchiverException(self.getError(e)));
      });
    });
  }
}
