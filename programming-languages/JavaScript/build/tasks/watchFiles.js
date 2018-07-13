/*********************************************************
* watchFiles.js                                         *
* All needed parts to be watched can be stored in here. *
* E.g. watching sass files etc.                         *
*********************************************************/
'use strict';

/* eslint import/no-extraneous-dependencies: off */

// path import.
import path from 'path';
// import fs.
import fs from 'fs';
// Autoprefixer import.
import Autoprefixer from 'autoprefixer';
// Node Sasss import.
import NodeSass from 'node-sass';
// PostCSS import.
import PostCSS from 'postcss';

// ClearDirectories.
import ClearDirectories from '../helpers/clearDirectories.js';

// Logger singleton import.
import { Logger } from '../../src/js/globals/logger.js';

/**********************************
* Begin Private Area for Module. *
**********************************/

// @NOTE: This Section is shared through every Instance of this given class.
// - You have been warned. -

/********************************
* End Private Area for Module. *
********************************/

/**
* Initialization of dev environment.
* @author Güney Özdemir <gueney.oezdemir@au.de>
*/
class Watcher {

  /**
  * constructor.
  */
  constructor() {
    // Set watchFilesTimer initially.
    this.watchFilesTimer = false;
  }

  /**
  * Returns the Project root dir path for current task.
  * @return {String} Project root path.
  */
  get projectRootDirPath() {
    // Return Project Dir.
    return path.resolve('./');
  }

  /**
  * To be deleted css file path
  * For more information {@link DeleteNPM}
  * @type {Array}
  */
  get pathToOldCSSFile() {
    return [
      path.resolve(this.projectRootDirPath + '/src/assets/css/main.css'),
    ];
  }

  /**
  * Returns Array with all paths (folders) to be watched.
  * NOTE: Only set path to parent folder because the recursive option will allways be set!
  * @return {Array} Strings -> Folderpaths.
  */
  get foldersToBeWatched() {
    return [
      `${this.projectRootDirPath}/src/assets/scss/`,
    ];
  }

  /**
  * Compiles scss for development use.
  * @return {void}
  */
  _processSCSS() {

    // Promisify method.
    return new Promise(async (resolve, reject) => {

      try {

        // // Feedback.
        Logger.log(this.constructor.name + '.' + this._processSCSS.name, 'Compiling for development ./src/assets/scss/main.scss...');

        // clear old css.
        await ClearDirectories.init(this.pathToOldCSSFile);

        // set path for scss process.
        let pathToMainSCSS = `${this.projectRootDirPath}/src/assets/scss/main.scss`;
        // Read Filecontent.
        let fileContent = fs.readFileSync(pathToMainSCSS, 'utf8');

        // minify it.
        let cssoutput = NodeSass.renderSync(
          {
            data: fileContent,
          }
        );

        // prefix files.
        let autoprefixedCSS = await PostCSS([ Autoprefixer ]).process(cssoutput.css);

        // write file.
        fs.writeFileSync(`${this.projectRootDirPath}/src/assets/css/main.css`, autoprefixedCSS.css);

        // Log success.
        Logger.logSuccess(this.constructor.name + '.' + this._processSCSS.name, 'started', 'done!');

        // Resolve promise.
        return resolve();

      } catch (e) {
        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this._processSCSS.name, e);
        return reject({ funcName: this.constructor.name + '.' + this._processSCSS.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

  /**
  * Depending on filename the processer starts another process.
  * @param  {String} eventType change, rename NOTE: rename will also be triggered when file is deleted from folder.
  * @param  {String} filename  Filename as utf8
  * @return {void}
  */
  _processWatchedFile(eventType, filename) {

    // Promisify method.
    return new Promise(async (resolve, reject) => {

      try {

        // check if no other process is running. And if eventType is right
        if (!this.watchFilesTimer &&  eventType === 'change') {

          // set process to running.
          this.watchFilesTimer = true;

          // Feedback.
          Logger.log(this.constructor.name + '.' + this._processWatchedFile.name, 'starting...');

          // if is scss proceed with defined logic.
          if (path.extname(filename) === '.scss') {
            // proceed with logic for file.
            await this._processSCSS();

          } else {

            // prevent watcher from firing again.
            setTimeout(() => {
              // set process to done.
              this.watchFilesTimer = false;
              // Log success.
              Logger.logSuccess(this.constructor.name + '.' + this._processWatchedFile.name, 'started', 'done!');
              // Resolve promise.
              return resolve();
            }, 500);

          }

          // prevent watcher from firing again.
          setTimeout(() => {
            // set process to done.
            this.watchFilesTimer = false;
            // Log success.
            Logger.logSuccess(this.constructor.name + '.' + this._processWatchedFile.name, 'started', 'done!');
            // Resolve promise.
            return resolve();
          }, 500);

        } else {
          // Resolve promise.
          return resolve();
        }

      } catch (e) {
        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this._processWatchedFile.name, e);
        return reject({ funcName: this.constructor.name + '.' + this._processWatchedFile.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

  /**
  * Distribute Main, will initialize the environment and fill all files the right way.
  * @return {void}
  */
  main() {

    return new Promise(async (resolve, reject) => {

      try {

        // Feedback.
        Logger.log(this.constructor.name + '.' + this.main.name, 'starting...');

        // Define options for watcher process.
        const watcherOptions = {
          persistent: true,
          recursive: true,
          encoding: 'utf8',
        };

        // Register a watcher process for each folder.
        for (let f = 0; f < this.foldersToBeWatched.length; f++) {
          fs.watch(this.foldersToBeWatched[f], watcherOptions, (e, f) => {this._processWatchedFile(e, f)});
        }

        // Log success.
        Logger.logSuccess(this.constructor.name + '.' + this.main.name, 'started', 'done!');

        // Resolve promise.
        return resolve();

      } catch (e) {
        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this.main.name, e);
        return reject({ funcName: this.constructor.name + '.' + this.main.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

}

/**
* Export new Class Distribute
* @type {Class}
*/
export default new Watcher();
