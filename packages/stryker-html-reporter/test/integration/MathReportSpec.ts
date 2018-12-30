import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import EventPlayer from '../helpers/EventPlayer';
import fileUrl = require('file-url');
import HtmlReporter from '../../src/HtmlReporter';
import { factory } from '@stryker-mutator/test-helpers';
import { Logger } from 'stryker-api/logging';

describe('HtmlReporter with example math project', () => {
  let sut: HtmlReporter;
  const baseDir = 'reports/mutation/math';
  let logger: sinon.SinonStubbedInstance<Logger>;

  beforeEach(() => {
    const config = new Config();
    logger = factory.logger();
    config.set({ htmlReporter: { baseDir } });
    sut = new HtmlReporter(config, logger);
    return new EventPlayer(path.join('testResources', 'mathEvents'))
      .replay(sut)
      .then(() => sut.wrapUp());
  });

  it('should have created index.html, Circle.js.html and Add.js.html file in the configured directory', () => {
    expectFileExists(`${baseDir}/index.html`, true);
    expectFileExists(`${baseDir}/Circle.js.html`, true);
    expectFileExists(`${baseDir}/Add.js.html`, true);
  });

  it('should output a log message with a link to the HTML report', () => {
    expect(logger.info).to.have.been.calledWith(`Your report can be found at: ${fileUrl(baseDir + '/index.html')}`);
  });

  describe('when initiated a second time with empty events', () => {
    beforeEach(() => {
      const config = new Config();
      config.set({ htmlReporter: { baseDir } });
      sut = new HtmlReporter(config, factory.logger());
      sut.onAllSourceFilesRead([]);
      sut.onAllMutantsTested([]);
      return sut.wrapUp();
    });

    it(`should clean the folder ${baseDir}`, () => {
      expectFileExists(`${baseDir}/index.html`, false);
      expectFileExists(`${baseDir}/Circle.js.html`, false);
      expectFileExists(`${baseDir}/Add.js.html`, false);
    });
  });
});

function expectFileExists(file: string, expected: boolean) {
  try {
    fs.readFileSync(file);
    expect(expected, `file ${file} does not exist`).to.be.true;
  } catch (err) {
    expect(expected, `file ${file} exists`).to.be.false;
  }
}
