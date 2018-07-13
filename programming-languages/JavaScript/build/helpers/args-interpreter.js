/***************************************************************
* args-interpreter.js                                         *
* Gets the current process arguments and returns needed ones. *
***************************************************************/
'use strict';


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

class ArgsInterpreter {

  /**
  * Konstruktor which holds current args.
  */
  constructor() {
    // set current Arguments.
    this.currentArgs = process.argv.slice(2);
  }

  /**
  * Returns an Object with all Build parameters.
  * @return {Object} Buildparameters
  */
  getBuildParams() {

    return new Promise((rs, rj) => {

      try {

        // Feedback.
        Logger.log(this.constructor.name + '.' + this.getBuildParams.name, 'trying to recieve build params...');

        let buildParams = {};

        for(let p = 0; p < this.currentArgs.length; p++) {

          if (this.currentArgs[p].startsWith('releaseDB')) {
            buildParams.db = this.currentArgs[p].replace(/releaseDB=/, '');
          }

        }

        // check values.
        if (buildParams.db == null) throw new Error('Database release parameter was not defined.');

        // Log success.
        Logger.logSuccess(this.constructor.name + '.' + this.getBuildParams.name, 'recieved', 'done!');

        // Resolve promise.
        return rs(buildParams);

      } catch (e) {
        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this.getBuildParams.name, e);
        return rj({ funcName: this.constructor.name + '.' + this.getBuildParams.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

}

export default new ArgsInterpreter();
