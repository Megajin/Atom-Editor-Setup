/*****************************************************************************
* distribute.js                                                              *
* Initialization of the environment, this task should run after npm install. *
*****************************************************************************/
'use strict';

/* eslint import/no-extraneous-dependencies: off */

// Glob import.
import glob from 'glob';
// path import.
import path from 'path';

// ClearDirectories.
import ClearDirectories from '../helpers/clearDirectories.js';
// Copyfiles.
import CopyFiles from '../helpers/copyFiles.js';

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
class Distribute {

  /**
  * Returns the Project root dir path for current task.
  * @return {String} Project root path.
  */
  get projectRootDirPath() {
    // Return Project Dir.
    return path.resolve('./');
  }

  /**
  * Path to webserver theme folder to make everything easier while developing.
  * @return {String} Project root path.
  */
  get pathToDevTheming() {
    // Return Project Dir.
    return path.resolve('F:/xampp/htdocs/wordpress/wp-content/themes');
  }

  /**
  * All directories that are to be cleared.
  * The parent directory will be deleted too, you have to exclude it explicitly!
  * For more information {@link DeleteNPM}
  * @type {Array}
  */
  get pathsToBeDeleted() {
    return [
      path.resolve(this.projectRootDirPath + '/dist/project_name-dist/**/*'),
      '!' + path.resolve(this.projectRootDirPath + '/dist/project_name-dist/'),
    ];
  }

  /**
  * All files to be coopied for distribution.
  * @type {Array}
  */
  get filesToBeCopied() {
    return [
      ...glob.sync(this.projectRootDirPath + '/log/'),
      ...glob.sync(this.projectRootDirPath + '/src/assets/css/*.css'),
      ...glob.sync(this.projectRootDirPath + '/src/assets/scss/main.scss'),
      ...glob.sync(this.projectRootDirPath + '/src/assets/fonts/**/*'),
      ...glob.sync(this.projectRootDirPath + '/src/assets/img/**/*'),
      ...glob.sync(this.projectRootDirPath + '/src/assets/js/**/*'),
      // ...glob.sync(this.projectRootDirPath + '/src/assets/jsx/**/*'),
      ...glob.sync(this.projectRootDirPath + '/src/handlebars/**/*'),
      ...glob.sync(this.projectRootDirPath + '/src/js/**/*'),
      ...glob.sync(this.projectRootDirPath + '/.babelrc'),
      ...glob.sync(this.projectRootDirPath + '/package.json'),
      ...glob.sync(this.projectRootDirPath + '/readme.md'),
    ];
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

        await ClearDirectories.init(this.pathsToBeDeleted).catch(err => Logger.logInfo(err.funcName, err.message, err.optInfo));
        await CopyFiles.init(this.filesToBeCopied, this.projectRootDirPath + '/dist/project_name-dist', true).catch(err => Logger.logInfo(err.funcName, err.message, err.optInfo));

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
export default new Distribute();
