/********************************************************************
 * Helpers.js                                                       *
 * Will hold a collection of methods which will "help" the runtime. *
 * Polyfills can find their way in here too if needed.              *
 ********************************************************************/
'use strict';

import { Logger } from './logger.js';

/**********************************
* Begin Private Area for Module. *
**********************************/

// @NOTE: This Section is shared through every Instance of this given class.
// - You have been warned. -

/********************************
* End Private Area for Module. *
********************************/

class HelpersClass {

  /**
   * Validating JSON.
   * @param  {String|JSON}  j json/string to be checked.
   * @return {Boolean}        true/false if json is valid or not.
   */
  isValidJSON(j) {

    try {
      
      // Param check.
      if (j == null) throw new TypeError('JSON to check is undefined or null.');

      // try to parse JSON.
      JSON.parse(j);

      // If no error was thrown return true.
      return true;

    } catch (e) {
      //Logg Error Message.
      Logger.logError(this.constructor.name + '.' + this.isValidJSON.name, e);
      // return false json.
      return false;
    }

  }

}

/**
* Export class as singleton class.
* @type {HelpersClass}
*/
export const Helpers = new HelpersClass();
