/******************************************************************
* copyFiles.js                                                    *
* Copies files to given path and replaces, minifies, etc in file. *
******************************************************************/
'use strict';

/* eslint import/no-extraneous-dependencies: off */

// Autoprefixer import.
import Autoprefixer from 'autoprefixer';
// Node Sasss import.
import  NodeSass  from 'node-sass';
// UglifyJS singleton import.
import UglifyCSS from 'uglifycss';
// UglifyJS singleton import.
import UglifyJS from 'uglify-es';
// fs import.
import fs from 'fs';
// path import.
import path from 'path';

// PostCSS  import.
import PostCSS from 'postcss';
// Logger singleton import.
import { Logger } from '../../src/js/globals/logger.js';
// make-dir-recursivley singleton import.
import { MakeDir } from '../../src/js/globals/make-dir-recursivley.js';

// import build params.
import ArgsInterpreter from './args-interpreter.js';

/**********************************
* Begin Private Area for Module. *
**********************************/

// @NOTE: This Section is shared through every Instance of this given class.
// - You have been warned. -

/********************************
* End Private Area for Module. *
********************************/

/**
* Copies given File into new destination.
*/
class CopyFiles {

  /**
  * Returns the Project root dir path for current task.
  * @return {String} Project root path.
  */
  get projectRootDirPath() {
    // Return Project Dir.
    return path.resolve('./');
  }

  /**
  * Copies given File into new destination.
  * @param  {Array} arrPaths hold object with oldPath and newPath for copied files.
  * @param  {String} targetPath Where to copy files.
  * @param  {Boolean} minify if file should be minified.
  * @return {void}
  */
  init(arrPaths, targetPath, minify) {

    // Promisify Method.
    return new Promise(async (resolve, reject) => {

      try {
        // Check Parameters.
        if (arrPaths == null || !Array.isArray(arrPaths)) throw new TypeError('in Parameters: \'arrPaths\'.');
        if (targetPath == null || typeof targetPath !== 'string') throw new TypeError('in Parameters: \'targetPath\'.');

        // recvieve params for current build.
        const buildParams = await ArgsInterpreter.getBuildParams();

        // normalize path.
        targetPath = path.normalize(targetPath);

        // Regex for path replace.
        let pathRegex = this.projectRootDirPath.replace(/\\/g, '\\\\');
        pathRegex = new RegExp(pathRegex);

        // Feedback
        Logger.log(this.constructor.name + '.' + this.init.name, 'trying to copy files:');

        for (let f = 0; f < arrPaths.length; f++) {
          // Feedback
          Logger.log(this.constructor.name + '.' + this.init.name, arrPaths[f].toString() + '...');
        }

        // Feedback.
        Logger.log(this.constructor.name + '.' + this.init.name, 'Options set to:');
        Logger.log(this.constructor.name + '.' + this.init.name, 'minify is set to: ' + minify);

        for (let cp = 0; cp < arrPaths.length; cp++) {

          // check array parameters.
          if (typeof arrPaths[cp] !== 'string') {
            throw new TypeError('Parameters are not in String format: \'arrPaths\'.');
          }

          // Replace project path so the actual pathstructure will remain.
          let pathStructure = path.resolve(arrPaths[cp]).replace(pathRegex, '');
          pathStructure = pathStructure.replace(/\\src/, '');
          let fileContent = null;

          // if pathStructure is empty skip steps.
          if (pathStructure !== '') {

            // Check if folders exist. This step kicks in if the whole path and file come in together.
            if (!fs.existsSync(path.dirname(path.resolve(targetPath + pathStructure)))) {
              await MakeDir.make(path.dirname(path.resolve(targetPath + pathStructure)), true);
            }

            //  Check if is raw directory.
            if (fs.statSync(arrPaths[cp]).isDirectory()) {
              await MakeDir.make(path.resolve(targetPath + pathStructure), true);

            } else {
              // Check for minification.
              if (minify && path.extname(arrPaths[cp]) === '.js') {

                // Read Filecontent.
                fileContent = fs.readFileSync(arrPaths[cp], 'utf8');

                // DB Replace.
                fileContent = fileContent.replace(/'svaurtdevaude'/g, `'${buildParams.db}'`);

                // minify it.
                let minifiedOutput = UglifyJS.minify(fileContent);

                // Check for warnings and errors.
                if (minifiedOutput.warnings != null) Logger.logInfo(this.constructor.name + '.' + this.init.name, minifiedOutput.warnings);
                if (minifiedOutput.error != null) Logger.logError(this.constructor.name + '.' + this.init.name, minifiedOutput.error);

                // write file.
                fs.writeFileSync(targetPath + pathStructure, minifiedOutput.code);

              } else if (minify && path.extname(arrPaths[cp]) === '.sh') {

                // Read Filecontent.
                fileContent = fs.readFileSync(arrPaths[cp], 'utf8');

                // strip comments and replace ^M error with normal \n.
                let minifiedOutput = fileContent.replace(/\r\n/g, '\n');
                minifiedOutput = minifiedOutput.replace(/(?!^#!\/bin\/bash)(^#.*.|^\s*#.*)/gm, '');
                minifiedOutput = minifiedOutput.replace(/^\s*$/gm, '');

                // write file.
                fs.writeFileSync(targetPath + pathStructure, minifiedOutput);

              } else if (minify && path.extname(arrPaths[cp]) === '.css') {

                // Read Filecontent.
                fileContent = fs.readFileSync(arrPaths[cp], 'utf8');

                // minify it.
                let minifiedOutput = UglifyCSS.processString(fileContent);

                // write file.
                fs.writeFileSync(targetPath + pathStructure, minifiedOutput);

              } else if (minify && path.extname(arrPaths[cp]) === '.scss') {

                // Read Filecontent.
                fileContent = fs.readFileSync(arrPaths[cp], 'utf8');

                // minify it.
                let cssoutput = NodeSass.renderSync(
                  {
                    data: fileContent,
                  }
                );

                let autoprefixedCSS = await PostCSS([ Autoprefixer ]).process(cssoutput.css);

                // minify it.
                let minifiedOutput = UglifyCSS.processString(autoprefixedCSS.css);

                // write file.
                fs.writeFileSync(targetPath + pathStructure.replace(/scss/g, 'css'), minifiedOutput);

              } else {
                // write file.
                fs.copyFileSync(arrPaths[cp], targetPath + pathStructure);

              }

            }

            // Log success.
            Logger.logSuccess(this.constructor.name + '.' + this.init.name, 'file has been copied to', targetPath + pathStructure);
          }

        }

        // resolve promise.
        return resolve();

      } catch (e) {
        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this.init.name, e);
        return reject({ funcName: this.constructor.name + '.' + this.init.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

}

/**
* Export new Class CopyFiles
* @type {Class}
*/
export default new CopyFiles();
