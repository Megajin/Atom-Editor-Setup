/*********************************************************
* In dieser Klasse werden verschiedene Parser definiert. *
* Parser.js                                              *
*                                                        *
*********************************************************/

// Logger singleton import.
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
* Parser Klasse, verschiedene Parser sind hier unterteilt.
* @class {Parser}
*/
class ParserClass {

  /**
  * Parsed XML zu JSON.
  * @method xml2json
  * @param  {XMLString} xmlData [XML Daten die geparsed werden sollen.]
  * @return {JSON}              [JSON]
  */
  xml2json(xmlData) {

    return new Promise((resolve, reject) => {

      try {

        // Parameter Check
        if (xmlData == null) throw new TypeError('in Parameters: \'xmlData\'.');
        // Feedback.
        Logger.log(this.constructor.name + '.' + this.xml2json.name, 'Trying to parse XML to JSON...');

        // xml2js Modul laden.
        const xml2js = require('xml2js');
        // XML zu JSON Parser.
        let parser = new xml2js.Parser();
        // XML String Parsen in JSON.
        parser.parseString(xmlData, (err, result) => {
          // Wenn Error dann...
          if (err) throw err;
          // Stream entgültig schließen.
          resolve(result);
        });

      } catch (e) {
        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this.xml2json.name, e);
        reject({ funcName: this.constructor.name + '.' + this.xml2json.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

}

/**
* Export class as singleton class.
* @type {ParserClass}
*/
export const Parser = new ParserClass();
