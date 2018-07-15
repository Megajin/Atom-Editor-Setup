/****************************************************
* Logger.                                           *
* Enable Advanced Logging for your Application.    *
****************************************************/
'use strict';

import { fs } from 'fs';
import { chalk } from 'chalk';
import { path } from 'path';
import { moment } from 'moment';

// MakeDir singleton import.
import { MakeDir } from './make-dir-recursivley.js';

/**********************************
* Begin Private Area for Module. *
**********************************/

// @NOTE: This Section is shared through every Instance of this given class.
// - You have been warned. -

/**
* ALL, ERROR are two types to be defined. In Production use ERROR only!
* @type {String}
*/
const DEBUG_LEVEL = 'ALL';
/**
* ALL, ERROR are two types to be defined. In Production use Error only!
* @type {String}
*/
const WRITEFILE_LEVEL = 'ERROR';

/********************************
* End Private Area for Module. *
********************************/

/**
* Exports Logger Class (was named like this for later exports)
* @author Güney Özdemir <gueney.oezdemir@au.de>
* @type {class}
*/
class LoggerClass {

  /**
  * Constructor of LoggerClass.
  */
  constructor() {

    // Check if is error or not.
    this.isError = false;
  }

  /**
  * Returns current Timestamp.
  * @private
  * @method getTimestamp
  * @return {String}     [HH:mm:ss Timestamp]
  */
  _getTimestamp() {

    try {
      // return Timestamp.
      return moment().format('HH:mm:ss');

    } catch (e) {
      //Log Error Message.
      this.logError(this.constructor.name + '.' + this._getTimestamp.funcName, e);
    }

  }

  /**
  * Writes into Log.log or ErrorLog.log
  * @private
  * @method _writeToLogFile
  * @param  {!String}        logFileName             Name of File, WARNING: only takes log.log or error.log.
  * @param  {!String}        logMessage              Message you want to log you should use this pattern:
  *                                                 '[' + this._getTimestamp() + ']' + ' Logmessage: ' + funcName + ': ' + textMessage + '\n'
  * @param  {?String}        [logFilePath='./log/']  Use this parameter to change logging files location.
  */
  _writeToLogFile(logFileName, logMessage, logFilePath) {

    return new Promise((resolve, reject) => {

      try {

        // Checker for proceed in write file.
        let proceed = false;

        // Check parameters for proceed.
        if (WRITEFILE_LEVEL === 'ALL') proceed = true;
        if (!proceed && WRITEFILE_LEVEL === 'ERROR' && this.isError) proceed = true;

        // Do nothing if proceed is false.
        if (!proceed) return resolve();

        // Parameter Check.
        if (logFilePath == null) logFilePath = './log/';
        if (logFileName == null || typeof logFileName !== 'string' ||
        logMessage == null || typeof logMessage !== 'string' || typeof logFilePath !== 'string') {
          throw new TypeError('in Parameters: \'logFileName\', \'logMessage\', \'logFilePath\'.');
        }

        if (logFileName !== 'log.log' && logFileName !== 'errorlog.log') throw new TypeError('Wrong Logfile defined allowed is: \'log.log\' or \'errorlog.log\'.');

        // Make Directory if necessary (MakeDir checks itself if directory is existent).
        MakeDir.make(path.resolve(logFilePath), true)
        .catch((err) => this.logInfo(err.funcName, err.message, err.optInfo))
        .then(() => {

          try {

            // Define size.
            let logFileSize = 0;

            // Check if file is existent if not set size to 0 so it will be generated.
            if (!fs.existsSync(path.resolve(logFilePath, logFileName))) {
              // Log Size.
              logFileSize = 0;
              // Generate file.
              fs.writeFileSync(logFilePath + logFileName, '');

              // Else check the size.
            } else {
              // Define size in Megabytes.
              logFileSize = Math.floor(fs.statSync(path.resolve(logFilePath, logFileName)).size / 1000000.0);
            }

            // Append to file if size is under 100MB.
            if (logFileSize <= 100 && logFileSize >= 0) {
              // Append to file.
              fs.appendFile(logFilePath + logFileName, logMessage, (err) => {
                // Cancel on error.
                if (err) throw err;
              });

              // Reset error state.
              this.isError = false;
              // Resolve Promise.
              resolve();

              // Once the File eceeds 100MB it will be rewritten.
              // @NOTE: errorlog.log will also be overwritten once it exceeds 100MB
              // However it should take a while until errorlog is full.
            } else {

              // Set the beginning.
              if (logFileName === 'log.log') logMessage = '##### Log ##### \n' + logMessage;
              if (logFileName === 'errorlog.log') logMessage = '##### Error log ##### \n' + logMessage;

              // Oveerwrite file.
              fs.writeFile(logFilePath + logFileName, logMessage, (err) => {
                // Cancel on error.
                if (err) throw err;
              });

              // Reset error state.
              this.isError = false;
              // Resolve Promise.
              resolve();
            }

          } catch (e) {
            // Log error and reject promise.
            this.logError(this.constructor.name + '.' + this._writeToLogFile.name, e);
            reject({ funcName: this.constructor.name + '.' + this._writeToLogFile.name, message: 'Promise was', optInfo: 'rejected' });
          }

        });

      } catch (e) {
        // Log error and reject promise.
        this.logError(this.constructor.name + '.' + this._writeToLogFile.name, e);
        reject({ funcName: this.constructor.name + '.' + this._writeToLogFile.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });
  }

  /**
  * Logs normal Message.
  * @public
  * @method log
  * @param  {String} funcName    Function name which called the Logger.
  * @param  {String} textMessage Message for log.
  */
  log(funcName, textMessage) {

    // Do not execute if log level is not ALL.
    if (DEBUG_LEVEL !== 'ALL') return;

    try {

      // Check Parameters.
      if (funcName == null || textMessage == null) throw new TypeError('in Parameters: \'funcName\', \'textMessage\'.');

      // Log Success Message.
      console.log(chalk.bold.gray('[' + this._getTimestamp() + ']') +
      chalk.bold.white(' Logmessage: ') +
      chalk.bold.cyan(funcName + ': ') +
      chalk.bold.white(textMessage));

      // log into file.
      this._writeToLogFile('log.log', '[' + this._getTimestamp() + ']' +
      ' Logmessage: ' + funcName + ': ' + textMessage + '\n')
      .catch((err) => this.logInfo(err.funcName, err.message, err.optInfo));

    } catch (e) {
      //Log Error Message.
      this.logError(this.constructor.name + '.' + this.log.name, e);
    }
  }

  /**
  * Logs success message.
  * @public
  * @method logSuccess
  * @param  {String}    funcName    Function name which called the Logger.
  * @param  {String}    textMessage Message for log.
  * @param  {String}    optInfo     Optional information, will be logged behind success log.
  */
  logSuccess(funcName, textMessage, optInfo) {

    // Do not execute if log level is not ALL.
    if (DEBUG_LEVEL !== 'ALL') return;

    try {

      // Check Parameters.
      if (funcName == null || textMessage == null) throw new TypeError('in Parameters: \'funcName\', \'textMessage\', \'optInfo\'.');

      // musste sein, weil einige Funktionen nicht klar kommen mit short circuits...
      let infoOPT = optInfo ? optInfo : '';

      // Log Success Message.
      console.log(chalk.bold.gray('[' + this._getTimestamp() + ']') +
      chalk.bold.green(' Logsuccess: ') +
      chalk.bold.cyan(funcName + ': ') +
      chalk.bold.white(textMessage + ': ') +
      chalk.bold.blue(infoOPT));

      // Log into file.
      this._writeToLogFile('log.log', '[' + this._getTimestamp() + ']' +
      ' Logsuccess: ' + funcName + ': ' + textMessage + ': ' + infoOPT + '\n')
      .catch((err) => this.logInfo(err.funcName, err.message, err.optInfo));

    } catch (e) {
      //Log Error Message.
      this.logError(this.constructor.name + '.' + this.logSuccess.name, e);
    }

  }

  /**
  * Logs error message
  * @public
  * @method logError
  * @param  {String}       funcName    Function name which called the Logger.
  * @param  {ErrorObject}  errorObject Javascript Error Object.
  */
  logError(funcName, errorObject) {

    try {

      // Check Parameters.
      if (funcName == null || errorObject == null) throw new TypeError('in Parameters: \'funcName\', \'errorObject\'.');

      // Set Error true to log information into file.
      this.isError = true;

      // Log Error Message.
      console.log(chalk.bold.gray('[' + this._getTimestamp() + ']') +
      chalk.bold.red(' Logerror: ') +
      chalk.bold.cyan(funcName + ': ') +
      chalk.bold.white(errorObject.name + ' ' + errorObject.message) +
      '\n' + chalk.bold.yellow(errorObject.stack));

      // Log into file.
      this._writeToLogFile('errorlog.log', '[' + this._getTimestamp() + ']' +
      ' Logerror: ' + funcName + ': ' +
      errorObject.name + ' ' + errorObject.message + '\n' + errorObject.stack + '\n')
      .catch((err) => this.logInfo(err.funcName, err.message, err.optInfo));

    } catch (e) {
      //Logg Error Message.
      this.logError(this.constructor.name + '.' + this.logError.name, e);
    }

  }

  /**
  * Logs info message.
  * @public
  * @method logInfo
  * @param  {String} funcName    Function name which called the Logger.
  * @param  {String} infoMessage Message to be logged as info.
  * @param  {String} infoOpt     Optional Message will be behind the info message text.
  */
  logInfo(funcName, infoMessage, infoOpt) {

    try {

      // Check Parameters.
      if (funcName == null && infoMessage == null) throw new TypeError('in Parameters: \'funcName\', \'infoMessage\'.');

      // Short circuits won't work in chalk somehow.
      let infoOPT = infoOpt ? infoOpt : '';

      // Set Error true to log information into file.
      this.isError = true;

      // Log info Message.
      console.log(chalk.bold.gray('[' + this._getTimestamp() + ']') +
      chalk.bold.magenta(' Loginfo: ') +
      chalk.bold.cyan(funcName + ': ') +
      chalk.bold.white(infoMessage + ': ') +
      chalk.bold.blue(infoOPT));

      // Log into file.
      this._writeToLogFile('log.log', '[' + this._getTimestamp() + ']' +
      ' Loginfo: ' + funcName + ': ' + infoMessage + ': ' + infoOPT + '\n')
      .catch((err) => this.logInfo(err.funcName, err.message, err.optInfo));

    } catch (e) {
      //Log Error Message.
      this.logError(this.constructor.name + '.' + this.logInfo.name, e);
    }

  }

}

/**
* Export class as singleton class.
* @type {LoggerClass}
*/
export const Logger = new LoggerClass();
