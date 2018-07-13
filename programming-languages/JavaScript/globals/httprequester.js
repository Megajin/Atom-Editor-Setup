/*********************************************************************
 * HTTPRequester.js                                                   *
 * Alle notwendingen Funktionen und Bauteile werden hier definiert um *
 * HTTP / HTTPS Requests zu machen.                                   *
 *********************************************************************/

import { https } from 'https';
import { http } from 'http';

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
 * Everything you need for your HTTPRequest.
 */
class HTTPRequesterClass {
  /**
   * Gibt die Standard Requestoptions zurück (nötigste optionen).
   * @method DefaultProtocol
   */
  get DefaultReqOptions() {
    return {
      protocol: 'https'
    };
  }

  /**
   * Gibt als Standard Protokoll HTTPS zurück.
   * @method DefaultProtocol
   */
  get DefaultProtocol() {
    return 'https';
  }

  /**
   * Gibt als Standard Encoding UTF8 zurück.
   * @method DefaultProtocol
   */
  get DefaultEncoding() {
    return 'utf8';
  }

  /**
   * Gibt als Standard RehectUnauthorized true zurück.
   * @method DefaultProtocol
   */
  get DefaultRejectUnauthorized() {
    return true;
  }

  /**
   * Gibt als Standard SecureProtocol SSLv23_method zurück.
   * @method DefaultProtocol
   */
  get DefaultSecureProtocol() {
    return 'SSLv23_method';
  }

  /**
   * Request Methode.
   * @method req
   * @param  {Object} httpOptions HTTP Ojekt Beispiel: {
   * host: '127.0.0.1',
   * port: 80,
   * method: 'GET',
   * path: '/apiSite.html',
   * auth: 'username:password',
   * headers: {
   * 'Content-Type': 'text/xml',
   * connection: 'keep-alive',
   * 'Content-Length': Buffer.byteLength(data),
   * }
   * }
   * @param  {RequestBody} requestBodyData kann TEXT/XML/HTML/JSON sein oder was auch immer vom Requestbody angenommen wird.
   * @param  {Object} reqOptions Request options setzen spezifische Optionen die für die Methoden gebraucht werden.
   * Ist ein Optionaler Parameter da alle notwendingen Infos automatisch gesetzt werden.
   * reqOptions {
   * protocol: 'http/https',
   * encoding: 'utf8',
   * }
   * @return {Promise} Gibt als Resolve den Response zurück falls vorhanden.
   */
  req(httpOptions, requestBodyData, reqOptions) {
    // Promise für Request generieren.
    return new Promise((resolve, reject) => {
      try {
        // Check Parameter.
        if (httpOptions == null || requestBodyData == null)
          throw new TypeError(
            "in Parameters: 'httpOptions', 'requestBodyData'."
          );
        // Request Optionen setzen falls nicht gesetzt.
        if (reqOptions == null) reqOptions = this.DefaultReqOptions;
        if (reqOptions.protocol == null)
          reqOptions.protocol = this.DefaultProtocol;
        if (reqOptions.encoding == null)
          reqOptions.encoding = this.DefaultEncoding;
        if (reqOptions.rejectUnauthorized == null)
          reqOptions.rejectUnauthorized = this.DefaultRejectUnauthorized;
        if (reqOptions.secureProtocol == null)
          reqOptions.secureProtocol = this.DefaultSecureProtocol;

        if (reqOptions.ca) httpOptions.ca = reqOptions.ca;

        // Um die RES Chunks zwischen zu speichern.
        let currentDataCache = '';

        // Https Protkoll Request.
        if (reqOptions.protocol === 'https') {
          // Zu den HTTP Optionen kommen extra optionen hinzu bei HTTPS.
          httpOptions.rejectUnauthorized = reqOptions.rejectUnauthorized;
          httpOptions.secureProtocol = reqOptions.secureProtocol;

          /**
           * Wenn das Protokoll auf HTTPS gesetzt ist dann Objekt generieren.
           * @protected
           * @type {constant}
           */
          const reqHTTPS = https.request(httpOptions, res => {
            // Statuscode abspeichern.
            let currentStatusCode = res.statusCode;

            // Encoding auf UTF-8 setzen.
            res.setEncoding(reqOptions.encoding);
            // Sobald daten zurück kommen diese partiell in Datencache speichern.
            res.on('data', chunk => {
              currentDataCache += chunk;
            });
            // Wenn Response beendet ist dann ende.
            res.on('end', () => {
              // Wenn der Statuscode ab 400 kommt dann gleich Error schmeißen.
              if (currentStatusCode >= 400) {
                //Logg Error Message.
                Logger.logError(
                  this.constructor.name + '.' + this.req.name,
                  new Error(
                    'Request exited with statuscode: ' +
                      currentStatusCode +
                      '\n' +
                      currentDataCache
                  )
                );
                reject({
                  funcName: this.constructor.name + '.' + this.req.name,
                  message: 'Promise was',
                  optInfo: 'rejected'
                });
              } else {
                // Feedback.
                Logger.logSuccess(
                  this.constructor.name + '.' + this.req.name,
                  'Module finished with Statuscode',
                  currentStatusCode
                );
                // Resolve Promise.
                resolve(currentDataCache);
              }
            });
          });

          // Sollte im Request ein Error auftreten.
          reqHTTPS.on('error', e => {
            //Logg Error Message.
            Logger.logError(this.constructor.name + '.' + this.req.name, e);
            reject({
              funcName: this.constructor.name + '.' + this.req.name,
              message: 'Promise was',
              optInfo: 'rejected'
            });
          });

          // Daten in den Request Body einfügen.
          reqHTTPS.write(requestBodyData);
          // Request beenden.
          reqHTTPS.end();

          // Http Protkoll Request.
        } else if (reqOptions.protocol === 'http') {
          /**
           * Wenn das Protokoll auf HTTP gesetzt ist dann Objekt generieren.
           * @type {constant}
           */
          const reqHTTP = http.request(httpOptions, res => {
            // Statuscode abspeichern.
            let currentStatusCode = res.statusCode;

            // Encoding auf UTF-8 setzen.
            res.setEncoding(reqOptions.encoding);
            // Sobald daten zurück kommen diese partiell in Datencache speichern.
            res.on('data', chunk => {
              currentDataCache += chunk;
            });
            // Wenn Response beendet ist dann ende.
            res.on('end', () => {
              // Wenn der Statuscode ab 400 kommt dann gleich Error schmeißen.
              if (currentStatusCode >= 400) {
                //Logg Error Message.
                Logger.logError(
                  this.constructor.name + '.' + this.req.name,
                  new Error(
                    'Request exited with statuscode: ' +
                      currentStatusCode +
                      '\n' +
                      currentDataCache
                  )
                );
                reject({
                  funcName: this.constructor.name + '.' + this.req.name,
                  message: 'Promise was',
                  optInfo: 'rejected'
                });
              } else {
                // Feedback.
                Logger.logSuccess(
                  this.constructor.name + '.' + this.req.name,
                  'Module finished with Statuscode',
                  currentStatusCode
                );
                // Resolve Promise.
                resolve(currentDataCache);
              }
            });
          });
          // Sollte im Request ein Error auftreten.
          reqHTTP.on('error', e => {
            //Logg Error Message.
            Logger.logError(this.constructor.name + '.' + this.req.name, e);
            reject({
              funcName: this.constructor.name + '.' + this.req.name,
              message: 'Promise was',
              optInfo: 'rejected'
            });
          });

          // Daten in den Request Body einfügen.
          reqHTTP.write(requestBodyData);
          // Request beenden.
          reqHTTP.end();
        } else {
          // Wenn Das Protokoll falsch definiert wurde.
          throw new TypeError('Unsupported Protocol: ' + reqOptions.protocol);
        }
      } catch (e) {
        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this.req.name, e);
        reject({
          funcName: this.constructor.name + '.' + this.req.name,
          message: 'Promise was',
          optInfo: 'rejected'
        });
      }
    });
  }

  /**
   * Get Methode.
   * @method get
   * @param  {Object} httpOptions HTTP Ojekt Beispiel: {
   * host: '127.0.0.1',
   * port: 80,
   * method: 'GET',
   * path: '/apiSite.html',
   * auth: 'username:password',
   * headers: {
   * 'Content-Type': 'text/xml',
   * connection: 'keep-alive',
   * 'Content-Length': Buffer.byteLength(data),
   * }
   * }
   * @param  {Object} reqOptions Request options setzen spezifische Optionen die für die Methoden gebraucht werden.
   * @return {Promise} Gibt als Resolve den Response zurück falls vorhanden.
   */
  get(httpOptions, reqOptions) {
    // Promise für Get Request.
    return new Promise((resolve, reject) => {
      try {
        // Check Parameter.
        if (httpOptions == null)
          throw new TypeError("in Parameters: 'httpOptions'.");
        // Request Optionen setzen falls nicht gesetzt.
        if (reqOptions == null) reqOptions = this.DefaultReqOptions;
        if (reqOptions.protocol == null)
          reqOptions.protocol = this.DefaultProtocol;
        if (reqOptions.encoding == null)
          reqOptions.encoding = this.DefaultEncoding;
        if (reqOptions.rejectUnauthorized == null)
          reqOptions.rejectUnauthorized = this.DefaultRejectUnauthorized;
        if (reqOptions.secureProtocol == null)
          reqOptions.secureProtocol = this.DefaultSecureProtocol;

        // Um die RES Chunks zwischen zu speichern.
        let currentDataCache = '';

        // Prüfen welches Protokoll verwendet werden soll.
        if (reqOptions.protocol === 'https') {
          // Zu den HTTP Optionen kommen extra optionen hinzu bei HTTPS.
          httpOptions.rejectUnauthorized = reqOptions.rejectUnauthorized;
          httpOptions.secureProtocol = reqOptions.secureProtocol;

          /**
           * Wenn das Protokoll auf HTTPS gesetzt ist dann Objekt generieren.
           * @type {constant}
           */
          const getHTTPS = https.get(httpOptions, res => {
            // Statuscode abspeichern.
            let currentStatusCode = res.statusCode;

            // Encoding auf UTF-8 setzen.
            res.setEncoding(reqOptions.encoding);
            // Sobald daten zurück kommen diese partiell in Datencache speichern.
            res.on('data', chunk => {
              currentDataCache += chunk;
            });
            // Wenn Response beendet ist dann ende.
            res.on('end', () => {
              // Wenn der Statuscode ab 400 kommt dann gleich Error schmeißen.
              if (currentStatusCode >= 400) {
                //Logg Error Message.
                Logger.logError(
                  this.constructor.name + '.' + this.get.name,
                  new Error(
                    'Request exited with statuscode: ' +
                      currentStatusCode +
                      '\n' +
                      currentDataCache
                  )
                );
                reject({
                  funcName: this.constructor.name + '.' + this.get.name,
                  message: 'Promise was',
                  optInfo: 'rejected'
                });
              } else {
                // Feedback.
                Logger.logSuccess(
                  this.constructor.name + '.' + this.get.name,
                  'Module finished with Statuscode',
                  currentStatusCode
                );
                // Resolve Promise.
                resolve(currentDataCache);
              }
            });
          });
          // Sollte im Request ein Error auftreten.
          getHTTPS.on('error', e => {
            //Logg Error Message.
            Logger.logError(this.constructor.name + '.' + this.get.name, e);
            reject({
              funcName: this.constructor.name + '.' + this.get.name,
              message: 'Promise was',
              optInfo: 'rejected'
            });
          });
        } else if (reqOptions.protocol === 'http') {
          /**
           * Wenn das Protokoll auf HTTP gesetzt ist dann Objekt generieren.
           * @type {constant}
           */
          const getHTTP = http.get(httpOptions, res => {
            // Statuscode abspeichern.
            let currentStatusCode = res.statusCode;

            // Encoding auf UTF-8 setzen.
            res.setEncoding(reqOptions.encoding);
            // Sobald daten zurück kommen diese partiell in Datencache speichern.
            res.on('data', chunk => {
              currentDataCache += chunk;
            });

            // Wenn Response beendet ist dann ende.
            res.on('end', () => {
              // Wenn der Statuscode ab 400 kommt dann gleich Error schmeißen.
              if (currentStatusCode >= 400) {
                //Logg Error Message.
                Logger.logError(
                  this.constructor.name + '.' + this.get.name,
                  new Error(
                    'Request exited with statuscode: ' +
                      currentStatusCode +
                      '\n' +
                      currentDataCache
                  )
                );
                reject({
                  funcName: this.constructor.name + '.' + this.get.name,
                  message: 'Promise was',
                  optInfo: 'rejected'
                });
              } else {
                // Feedback.
                Logger.logSuccess(
                  this.constructor.name + '.' + this.get.name,
                  'Module finished with Statuscode',
                  currentStatusCode
                );
                // Resolve Promise.
                resolve(currentDataCache);
              }
            });
          });

          // Sollte im Request ein Error auftreten.
          getHTTP.on('error', e => {
            //Logg Error Message.
            Logger.logError(this.constructor.name + '.' + this.get.name, e);
            reject({
              funcName: this.constructor.name + '.' + this.get.name,
              message: 'Promise was',
              optInfo: 'rejected'
            });
          });
        } else {
          // Wenn Das Protokoll falsch definiert wurde.
          throw new TypeError('Unsupported Protocol: ' + reqOptions.protocol);
        }
      } catch (e) {
        //Logg Error Message.
        Logger.logError(this.constructor.name + '.' + this.get.name, e);
        reject({
          funcName: this.constructor.name + '.' + this.get.name,
          message: 'Promise was',
          optInfo: 'rejected'
        });
      }
    });
  }
}

/**
 * Export class as singleton class.
 * @type {HTTPRequesterClass}
 */
export const HTTPRequester = new HTTPRequesterClass();
