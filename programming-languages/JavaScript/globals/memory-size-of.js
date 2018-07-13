/****************************************
* memory-size-of.js                     *
* Determine size of variable in memory. *
****************************************/
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

/**
* Determine size of variable.
* @author Güney Özdemir <gueney.oezdemir@au.de>
* @type {class}
*/
class MemorySizeOfClass {

  /**
   * Generator Method which will iterate through given Array or Object and give back the bytes.
   * @param  {Object | Array} obj Object or Array to iterate through.
   * @param  {bytes} b bytes from before.
   * @return {Generator} Returns a call to sizeif per iteration.
   */
  * _generateObjectSize(obj, b) {

    // Generate Array for Promise all.
    let promiseArray = [];

    // iterate through keys.
    for (let key in obj) {

      // If Object has the property proceed.
      if (obj.hasOwnProperty(key)) {
        // call sizeof recursive.
        promiseArray.push(
          this._sizeOf(obj[key], b)
          .catch((err) => {
          //Log Error Message.
          Logger.logInfo(err.funcName, err.message, err.optInfo);
          // If any error occured return size 0;
          return 0;
        })
        // return bytes.
        .then(bytes => bytes)
      );

      }

    }
    // Yield Promise array.
    yield Promise.all(promiseArray).then(bytes => bytes);

  }

  /**
  * Determine size of variable in memory.
  * There is more information about data structure at MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
  * @param  {String | Number | Boolean | Array | Object} v Any Variable passed to this function will be sized.
  * @param  {Number} b bytes which will be stored.
  * @return {Number} returns bytes.
  */
  _sizeOf(v, b) {

    // Promisify method.
    return new Promise((resolve, reject) => {

      // Check if parameter was defined.
      if (v !== null && v !== undefined) {

        // set type initially.
        let typeV = typeof v;

        /**
        * Depending on variable type do stuff.
        */

        // If is number...
        if (typeV === 'number') {
          /**
           * According to the ECMAScript standard,
           * there is only one number type: the double-precision 64-bit
           * binary format IEEE 754 value.
           * So we add 8 memory bytes.
           */
          b += 8;
          // return bytes.
          return resolve(b);
        }

        // If is string...
        if (typeV === 'string') {
          /**
           * JavaScript's String type is used to represent textual data.
           * It is a set of "elements" of 16-bit unsigned integer values.
           * So we add memory bytes depending on string length
           * but always 2 bytes per character.
           */
          b += v.length * 2;
          // return bytes.
          return resolve(b);
        }

        // If is boolean...
        if (typeV === 'boolean') {
          /**
           * After reading the MDN section about data structures and the google
           * answer from here: https://groups.google.com/forum/#!msg/nodejs/U32oJAdMDKo/rpprJg39XR0J
           * I made a conclusion about byte sizes in JavaScript, still I'm not 100% sure.
           * So we add 4 memory bytes.
           */
          b += 4;
          // return bytes.
          return resolve(b);
        }

        // If is object...
        if (typeV === 'object') {
          // add memory bytes depending on object property.

          /**
           * toString() can be used with every object and allows you to get its class.
           * To use the Object.prototype.toString() with every object, you need to call
           * Function.prototype.call() or Function.prototype.apply() on it,
           * passing the object you want to inspect as the first parameter called thisArg.
           */
          let vClass = Object.prototype.toString.call(v).slice(8, -1);

          // If is object or array.
          if (vClass === 'Object' || vClass === 'Array') {
            // Construct iterator for _generatedObjectSize.
            let gen = this._generateObjectSize(v, b);
            // loop through values
            for (let g of gen) {
              // Promise all array
              g.then((arrBytes) => {
                // Summ bytzes from array.
                arrBytes.map(n => b += n);
                // resolve promise.
                return resolve(b);
              });
            }

          } else {
            // If for a reason the Object class is not defined stringify it and add it to bytes.
            b += v.toString().length * 2;
            // return bytes.
            return resolve(b);
          }

        }

      } else {
        //Log Error Message.
        Logger.logError(this.constructor.name + '.' + this._sizeOf.name, new TypeError('Variable was not defined.'));
        return reject({ funcName: this.constructor.name + '.' + this._sizeOf.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

  /**
   * Will format bytes into readable size.
   * @param  {Number} b Bytes which will be passed by.
   * @param  {Object} [o] optional options, if not defined bytes will be returned as number.
   * @return {Number | String} depending on obtions number or string will be returned.
   */
  _formatByteSize(b, o) {

    return new Promise((resolve, reject) => {

      try {
        // Case bytes.
        if (o.format === 'bytes') {
          // If output is defined as number or is null.
          if (o.desiredOutput == null || o.desiredOutput === 'number') {
            return resolve(b.toFixed(o.toFixed));
          }
          // If output is desired as string.
          if (o.desiredOutput != null || o.desiredOutput === 'string') {
            return resolve(b.toFixed(o.toFixed) + ' b');
          }
        }

        // Case kilobytes.
        if (o.format === 'kilobytes') {
          // If output is defined as number or is null.
          if (o.desiredOutput == null || o.desiredOutput === 'number') {
            return resolve((b / 1024).toFixed(o.toFixed));
          }
          // If output is desired as string.
          if (o.desiredOutput != null || o.desiredOutput === 'string') {
            return resolve((b / 1024).toFixed(o.toFixed) + ' kb');
          }
        }

        // Case megabytes.
        if (o.format === 'megabytes') {
          // If output is defined as number or is null.
          if (o.desiredOutput == null || o.desiredOutput === 'number') {
            return resolve((b / 1048576).toFixed(o.toFixed));
          }
          // If output is desired as string.
          if (o.desiredOutput != null || o.desiredOutput === 'string') {
            return resolve((b / 1048576).toFixed(o.toFixed) + ' mb');
          }
        }

        // Case gigabytes.
        if (o.format === 'gigabytes') {
          // If output is defined as number or is null.
          if (o.desiredOutput == null || o.desiredOutput === 'number') {
            return resolve((b / 1073741824).toFixed(o.toFixed));
          }
          // If output is desired as string.
          if (o.desiredOutput != null || o.desiredOutput === 'string') {
            return resolve((b / 1073741824).toFixed(o.toFixed) + ' gb');
          }
        }

        // If nothing could've been returned throw error.
        throw new TypeError('One or more options were false defined, recheck them.');

      } catch (e) {
        //Log Error Message.
        Logger.logError(this.constructor.name + '.' + this._formatByteSize.name, e);
        return reject({ funcName: this.constructor.name + '.' + this._formatByteSize.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

  /**
   * Get size of passed variable.
   * @param  {String | Number | Boolean | Array | Object} v Any Variable passed to this function will be sized.
   * @param  {Object} [o] optional options, if not defined bytes will be returned as number.
   * @return {Number | String} depending on obtions number or string will be returned.
   */
  getSize(v, o) {

    // Promisfy method.
    return new Promise((resolve, reject) => {

      try {

        // Check Parameters and set defaults.
        if (v == null) throw new TypeError('Variable to be sized was not defined!');
        if (o == null || typeof o !== 'object') o = {};
        if (o.format == null) o.format = 'bytes';
        if (o.desiredOutput == null) o.desiredOutput = 'number';
        if (o.toFixed == null || typeof o.toFixed !== 'number') o.toFixed = 0;

        // Define byte variable..
        let bytes = 0;

        // Get size of variable.
        this._sizeOf(v, bytes)
        .catch((err) => Logger.logInfo(err.funcName, err.message, err.optInfo))
        // Format size.
        .then((b) => this._formatByteSize(b, o))
        .catch((err) => Logger.logInfo(err.funcName, err.message, err.optInfo))
         // resolve with size of variable.
        .then((data) => resolve(data));

      } catch (e) {
        //Log Error Message.
        Logger.logError(this.constructor.name + '.' + this.getSize.name, e);
        return reject({ funcName: this.constructor.name + '.' + this.getSize.name, message: 'Promise was', optInfo: 'rejected' });
      }

    });

  }

}

/**
* Export class as singleton class.
* @type {MemorySizeOfClass}
*/
export const MemorySizeOf = new MemorySizeOfClass();
