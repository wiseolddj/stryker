import { File } from 'stryker-api/core';
import { Logger } from 'stryker-api/logging';
import { normalizeWhiteSpaces } from '../utils/objectUtils';
import os = require('os');

export default class InputFileCollection {
  public readonly files: ReadonlyArray<File>;
  public readonly filesToMutate: ReadonlyArray<File>;

  constructor(files: ReadonlyArray<File>, mutateGlobResult: ReadonlyArray<string>) {
    this.files = files;
    this.filesToMutate = files.filter(file => mutateGlobResult.some(name => name === file.name));
  }

  public logFiles(log: Logger) {
    if (!this.files.length) {
      log.warn(`No files selected. Please make sure you either${os.EOL}` +
       ` (1) Run Stryker inside a Git repository; or${os.EOL}` +
       ` (2) Specify the \`files\` property in your Stryker configuration (\`--files via command line\`).`);
    } else {
      if (this.filesToMutate.length) {
        log.info(`Found ${this.filesToMutate.length} of ${this.files.length} file(s) to be mutated.`);
      } else {
        log.warn(normalizeWhiteSpaces(`No files marked to be mutated, Stryker will perform a dry-run without actually mutating anything.
        You can configure the \`mutate\` property in your stryker.conf.js file (or use \`--mutate\` via command line).`));
      }
      if (log.isDebugEnabled) {
        log.debug(`All input files: ${JSON.stringify(this.files.map(file => file.name), null, 2)}`);
        log.debug(`Files to mutate: ${JSON.stringify(this.filesToMutate.map(file => file.name), null, 2)}`);
      }
    }
  }
}
