/**
 * (C) B1 Systems GmbH, 2020+
 * https://www.b1-systems.de
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * https://www.mozilla.org/en-US/MPL/2.0/
 *
 * @license Mozilla Public License, v. 2.0
 */

import { HttpClientResponse } from 'djt-http-client';
import { Payload } from './dispatcher-interfaces';

/**
 * Extended Flux payload class including Horde specific properties. Action
 * names dispatched are automatically generated based on camel case variant
 * of "hordeAction" starting with lower case word and "Error" or "Response"
 * added if not defined. Actions could be named "Store.doSomething".
 *
 * @author    Tobias Wolf
 * @copyright B1 Systems GmbH, 2020+
 * @package   horde-ajax-client
 * @since     v1.0.0
 * @license   https://www.mozilla.org/en-US/MPL/2.0/
 *            Mozilla Public License, v. 2.0
 */
export class HordeRequestPayload implements Payload {
    /**
     * CamelCase generation RegExp
     */
    protected static readonly RE_NON_WORD_CAMEL_CASE_SPLITTER = /[^a-zA-Z0-9]+/;

    /**
     * Object index signature
     */
    [key: string]: unknown;

    /**
     * Action to call after promise fails
     */
    public errorAction?: string;
    /**
     * Horde action to call
     */
    public hordeAction?: string;
    /**
     * Horde action request payload for conflicting payload keys
     */
    public requestPayload?: { [key: string]: unknown };
    /**
     * Response action to call after promise
     */
    public responseAction?: string;
    /**
     * Response action payload
     */
    public responsePayload?: { [key: string]: unknown };
    /**
     * Horde action request promise
     */
    protected _promise: Promise<HttpClientResponse>;
    /**
     * Horde action to call
     */
    public type: string;

    /**
     * Constructor (HordeRequestPayload)
     *
     * @param args Payload arguments given
     *
     * @since v1.0.0
     */
    constructor(args: { [key: string]: unknown }) {
        for (const key in args) {
            this[key] = args[key];
        }

        if (typeof this.type != 'string') {
            throw new Error('Horde payload type given is invalid');
        }

        if (this.hordeAction === undefined) {
            this.hordeAction = this.type;
        }

        if (this.errorAction === undefined || this.responseAction === undefined) {
            const words = this.hordeAction.split(HordeRequestPayload.RE_NON_WORD_CAMEL_CASE_SPLITTER);
            let baseActionName = words.shift();

            for (const word of words) {
                baseActionName += word[0].toUpperCase() + word.slice(1);
            }

            if (this.errorAction === undefined) {
                this.errorAction = baseActionName + 'Error';
            }

            if (this.responseAction === undefined) {
                this.responseAction = baseActionName + 'Response';
            }
        }
    }

    /**
     * Returns the Horde action request promise.
     */
    public get promise() {
        return this._promise;
    }

    /**
     * Sets the Horde action request promise.
     */
    public set promise(promise: Promise<HttpClientResponse>) {
        if (this._promise !== undefined) {
            throw new Error('Horde action request payload can not set more than one promise');
        }

        this._promise = promise;
    }
}
