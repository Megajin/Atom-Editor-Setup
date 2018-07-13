/************************************
* make-dir-recursivley.js          *
* Generates file path recursively. *
* ES6 Singleton Wrapper.           *
************************************/
'use strict';

import { fs } from 'fs';
import { path } from 'path';

// Logger as singleton.
import { Logger } from './logger.js';

/**********************************
* Begin Private Area for Module. *
**********************************/

// @NOTE: This Section is shared through every Instance of this given class.
// - You have been warned. -

/********************************
* End Private Area for Module. *
********************************/

/**
* Named like this for later use as Singleton.
* @author Güney Özdemir <gueney.oezdemir@au.de>
*/
class MakeDirClass {

  /**
  * Generates a file path
  * @public
  * @param  {String}   targetDir              Path to be genrated.
  * @param  {?Boolean} [recursively=false]    If set to true, path will be generated recursively. Default ist set to false.
  */
  make(targetDir, recursively) {

    // Promisify function.
    return new Promise((resolve, reject) => {

      try {

        // Check parameters
        if (targetDir == null) throw new TypeError('Error in parameters: \'targetDir\'.');
        if (recursively != null && typeof recursively !== 'boolean') throw new TypeError('Error in parameters: \'recursively\'.');

        // Set default parameters.
        if (recursively == null) recursively = false;

        // If path is existent resolve Promise and leave function.
        if (fs.existsSync(targetDir)) {
          resolve();
          return;
        }

        // If not recursively wanted then just add the folder and leave.
        if (!recursively) {
          // Make Path.
          fs.mkdirSync(targetDir);
          // Resolve Promise.
          resolve();

        } else {

          // Split given path.
          let splittedPath = targetDir.split(path.sep);
          // To resolve path later on.
          let lastPath = splittedPath[0] + '/';

          // Loop through the array and add folders.
          for (let s = 0; s < splittedPath.length; s++) {
            // Set current directory through resolve.
            let currentDirectory = path.resolve(lastPath, splittedPath[s]);

            // If directory is not existent create it.
            if (!fs.existsSync(currentDirectory)) fs.mkdirSync(currentDirectory);

            if (s !== 0 && s !== splittedPath.length - 1)
            // Set Path together for recursion.
            lastPath += splittedPath[s] + '/';

          }

          // Resolve Promise.
          resolve();

        }

      } catch (e) {
        // Log error and reject promise.
        Logger.logError(this.constructor.name + '.' + this.make.name, e);
        reject({ funcName: this.constructor.name + '.' + this.make.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

}

/**
* Export class as singleton class.
* @type {MakeDirClass}
*/
export const MakeDir = new MakeDirClass();
