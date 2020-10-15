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

import { Dispatcher } from 'flux';
import { HordeAjaxClient } from '@b1-systems/horde-ajax-client';
import { HordeRequestPayload } from './horde-request-payload';
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
export class HordeRequest {
    /**
     * "HordeAjaxClient" singleton
     */
    protected static hordeAjaxClient: HordeAjaxClient;

    /**
     * Object index signature
     */
    [key: string]: unknown;

    /**
     * Horde action request promise
     */
    protected dispatcher: Dispatcher<Payload>;
    /**
     * Horde action request payload
     */
    protected payload: HordeRequestPayload;

    /**
     * Constructor (HordeRequest)
     *
     * @param args Payload arguments given
     *
     * @since v1.0.0
     */
    constructor(dispatcher: Dispatcher<Payload>, payload: HordeRequestPayload) {
        this.dispatcher = dispatcher;
        this.payload = payload;
    }

    /**
     * Handles the "HordeRequest" calling the Horde backend.
     *
     * @param payload Payload to dispatch
     *
     * @return Horde request promise instance
     * @since  v1.0.0
     */
    public execute() {
        const data = { } as { [key: string]: unknown };
        let errorAction: string;
        let hordeAction;
        const hordeAjaxClient = HordeRequest.getHordeAjaxClientInstance();
        let requestPayload: { [key: string]: unknown };
        let responseAction: string;
        let responsePayload: { [key: string]: unknown };

        for (const key in this.payload) {
            switch (key) {
                case 'errorAction':
                    errorAction = this.payload.errorAction;
                    break;
                case 'hordeAction':
                    hordeAction = this.payload.hordeAction;
                    break;
                case 'requestPayload':
                    requestPayload = this.payload.requestPayload;
                    break;
                case 'responseAction':
                    responseAction = this.payload.responseAction;
                    break;
                case 'responsePayload':
                    responsePayload = this.payload.responsePayload;
                    break;
                case 'type':
                    break;
                default:
                    data[key] = this.payload[key];
            }
        }

        if (requestPayload) {
            for (const key in requestPayload) {
                data[key] = requestPayload[key];
            }
        }

        hordeAjaxClient.url = `./${hordeAction}`;
        const promise = hordeAjaxClient.requestPost(data);

        if (errorAction) {
            promise.catch((reason: unknown) => {
                /* eslint-disable sort-keys */
                this.dispatcher.dispatch({
                    type: errorAction,
                    error: reason
                });
                /* eslint-enable sort-keys */
            });
        }

        return promise.then((response: HttpClientResponse) => {
            if (response.body instanceof Error) {
                throw response.body;
            }

            if (typeof response.body == 'object') {
                const responseDispatchPayload = { } as Payload;

                if (responsePayload) {
                    for (const key in responsePayload) {
                        responseDispatchPayload[key] = responsePayload[key];
                    }
                }

                for (const key in response.body) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                    responseDispatchPayload[key] = (response.body as any)[key];
                }

                responseDispatchPayload.type = responseAction;

                this.dispatcher.dispatch(responseDispatchPayload);
            }

            return response;
        });
    }

    /**
     * Returns the "HordeAjaxClient" singleton.
     *
     * @return "HordeAjaxClient" instance
     * @since  v1.0.0
     */
    protected static getHordeAjaxClientInstance() {
        if (!this.hordeAjaxClient) {
            this.hordeAjaxClient = new HordeAjaxClient();
        }

        return this.hordeAjaxClient;
    }
}
