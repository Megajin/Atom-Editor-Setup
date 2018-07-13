/***********************************************************
* Datenbank Connector.                                     *
* Hier werden alle DB Relevanten Informationen hinterlegt. *
***********************************************************/

// Logger singleton import.
import { Logger } from './logger.js';
// SQL singleton import.
import { sql } from './sql.js';

/**********************************
* Begin Private Area for Module. *
**********************************/

// @NOTE: This Section is shared through every Instance of this given class.
// - You have been warned. -

/********************************
* End Private Area for Module. *
********************************/

/**
* Datenbankinformationen liegen hier ab.
* @class DataBaseConnector
*/
class DataBaseConnectorClass {

  /**
  * Konstruktor von DataBaseConnector
  * @method constructor
  * @param  {class}    LoggerClass  [Loggerklasse aus den Globals]
  * @param  {string}    dbName      [String ob SQL oder Mongo je nach name.]
  * @return {void}                  [nothing.]
  */
  constructor(dbName) {

    /**
    * Name der Datenbank die gebraucht wird.
    * @protected
    * @type {string}
    */
    this.dbName = dbName;

    /**
    * Anhand vom Nameen wird ein getter aufgerufen deswegen this[dbname] <- entspricht dann dem getter.
    * @protected
    * @type {connection}
    */
    this.dbConnection = this[dbName];
  }

  /**
  * Return iteration limit based on information.
  * This step is very important for a sql query.
  * Since the limit is set at 1k inserts for one query.
  * @param  {!Number} iterationLimit   Number of, iterationLimit be careful sql allows inly 1k inserts at the same query.
  * @param  {!Number} currentIteration Number of, current iteration.
  * @param  {!Number} objectLength     Number of, object length.
  * @return {Number}                  The desired iteration limit.
  * @example <caption>iteration limit usage</caption>
  * CherwellClass.getIterationLimit((+arrObjects.length <= 1000) ? arrObjects.length : 0, currentIteration, +arrObjects.length);
  *
  */
  getIterationLimit(iterationLimit, currentIteration, objectLength) {

    // promisify method.
    return new Promise((resolve, reject) => {

      try {

        // Check Parameters.
        if (iterationLimit == null || !Number.isInteger(iterationLimit)) throw new TypeError('Parameter: \'iterationLimit\' is not defined or has the wrong type, found this: ' + iterationLimit + '.');
        if (currentIteration == null || !Number.isInteger(currentIteration)) throw new TypeError('Parameter: \'currentIteration\' is not defined or has the wrong type, found this: ' + currentIteration + '.');
        if (objectLength == null || !Number.isInteger(objectLength)) throw new TypeError('Parameter: \'objectLength\' is not defined or has the wrong type, found this: ' + objectLength + '.');

        // If we did exceed the 1k mark do some math...
        if (iterationLimit === 0) {

          // if is the first run set to 1.000.
          if (currentIteration === 0) iterationLimit = 1000;
          // if one iteration is already run before take that in account.
          if (currentIteration > 0) iterationLimit = objectLength - currentIteration;
          // Check if iterationLimit eceeds 1.000 again.
          if (iterationLimit > 1000) iterationLimit = 1000;
          // Add last iteration counter to limit to access the array properly.
          return resolve(currentIteration + iterationLimit);

        } else {

          // Return iterationLimit.
          return resolve(iterationLimit);

}

      } catch (e) {

        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this.getIterationLimit.name, e);
        return reject({ funcName: this.constructor.name + '.' + this.getIterationLimit.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

  /**
  * Initiates db connection and uses the given query.
  * @param  {!String} dbconf  Databasename svaurtdev.au.de -> svaurtdevaude
  * @param  {!String} query   Query which is going to be used.
  * @return {String}          If query is going to response with a result, it will be returned.
  */
  insertSQL(dbconf, query) {

    // promisify method.
    return new Promise(async (resolve, reject) => {

      try {

        // Check Parameters.
        if (dbconf == null ||!(dbconf instanceof Object && dbconf.constructor === Object)) throw new TypeError('Parameter: \'dbconf\' is not defined or not existent in configuration. ');
        if (query == null || typeof query !== 'string') throw new TypeError('Parameter: \'query\' is not defined or in wrong format. ');

        // Open Connection.
        let pool = await sql.connect(dbconf);
        // Open request stream.
        let request = await pool.request().query(query);

        // close connection once done.
        sql.close(pool);

        // Return resolved data.
        return resolve(request);

      } catch (e) {
        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this.insertSQL.name, e);
        return reject({ funcName: this.constructor.name + '.' + this.insertSQL.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

}

/**
* Export class as singleton class.
* @type {DataBaseConnectorClass}
*/
export default DataBaseConnectorClass;
