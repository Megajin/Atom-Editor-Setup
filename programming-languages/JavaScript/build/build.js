/********************************************************
* build.js                                             *
* All necessary steps to compile, build and distribute *
* will be defined from here on.                        *
********************************************************/
'use strict';

// Import Distributer.
import Distribute from './tasks/distribute.js';
// Import Watcher.
import Watcher from './tasks/watchFiles.js';

// Logger singleton import.
import { Logger } from '../src/js/globals/logger.js';

/**
* Export desired Method,
* after that use it in package.json
* to run the desire process through console.
*/

/**
* @author Güney Özdemir <gueney.oezdemir@au.de>
*/
class BuildAndDistribute {

  /**
  * Distribution
  * @author Güney Özdemir <gueney.oezdemir@au.de>
  * @return {void}
  */
  static async distribute() {
    // Feedback.
    Logger.log('Build.distribute', 'starting...');
    // Start Task.
    await Distribute.main();
    // Feedback.
    Logger.log('Build.distribute', 'done!');
  }

  static async watchFiles() {
    // Feedback.
    Logger.log('Build.watchFiles', 'starting...');
    // Start Task.
    await Watcher.main();
    // Feedback.
    Logger.log('Build.watchFiles', 'done!');
  }


}

/**
* Export Class.
* @type {Class}
*/
export default new BuildAndDistribute();
/**
* Export Module Function to use in Package.json.
* @return {void}
*/
module.exports.distribute = () => { BuildAndDistribute.distribute() };
/**
* Export Module Function to use in Package.json.
* @return {void}
*/
module.exports.watchFiles = () => { BuildAndDistribute.watchFiles() };
