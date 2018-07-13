/********************************************
* clearDirectories.js                       *
* Clears a given directory with subfolders! *
********************************************/
'use strict';

/* eslint import/no-extraneous-dependencies: off */

// Del import.
import del from 'del';
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
 * Deletes given Files and Folders in Array.
 * @type {Class}
 */
class ClearDirectories {

  /**
  * Deletes given Files and Folders in Array.
  * The glob pattern \*\* matches all children and the parent.
  * You have to explicitly ignore the parent directories too!
  * E.g. ['public/assets/\*\*', '!public/assets', '!public/assets/goat.png'].
  * @param  {Array} arrFilePaths Array filled with paths as strings.
  * @return {void}
  */
  init(arrFilePaths) {

    // Promisify Method.
    return new Promise(async (resolve, reject) => {

      try {

        // Check Parameters.
        if (arrFilePaths == null || !Array.isArray(arrFilePaths)) throw new TypeError('in Parameters: \'arrFilePaths\'.');

        // Feedback.
        Logger.log(this.constructor.name + '.' + this.init.name, 'trying to delete paths:');

        for (let s = 0; s < arrFilePaths.length; s++) {
          // Feedback.
          Logger.log(this.constructor.name + '.' + this.init.name, arrFilePaths[s].toString() + '...');
        }

        // Delete given files.
        let deletedPaths = await del(arrFilePaths, { force: true });

        if (deletedPaths.length < 1) {
          // Log deleted files.
          Logger.logSuccess(this.constructor.name + '.' + this.init.name, 'Nothing to delete', 'proceeding.');
        }

        // Iterate through given array.
        for (let dl = 0; dl < deletedPaths.length; dl++) {
          // Log deleted files.
          Logger.logSuccess(this.constructor.name + '.' + this.init.name, 'Files/Folders deleted', deletedPaths[dl].toString());
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
* Export new Class ClearDirectories
* @type {Class}
*/
export default new ClearDirectories();
