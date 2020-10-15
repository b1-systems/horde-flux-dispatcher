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

import { Dispatcher as _Dispatcher } from 'flux';
import { HordeRequest } from './horde-request';
import { HordeRequestPayload } from './horde-request-payload';
import { Payload } from './dispatcher-interfaces';

/**
 * A Flux dispatcher handling Horde actions.
 *
 * @author    Tobias Wolf
 * @copyright B1 Systems GmbH, 2020+
 * @package   horde-ajax-client
 * @since     v1.0.0
 * @license   https://www.mozilla.org/en-US/MPL/2.0/
 *            Mozilla Public License, v. 2.0
 */
export class Dispatcher<P extends Payload = Payload> extends _Dispatcher<P> {
    /**
     * Flux dispatcher singleton
     */
    protected static dispatcher: Dispatcher<any>;

    /**
     * facebook.github.io/flux: Dispatches a payload to all registered callbacks.
     *
     * @param payload Payload to dispatch
     *
     * @since v1.0.0
     */
    public dispatch(payload: P) {
        if (payload instanceof HordeRequestPayload) {
            payload.promise = this.handleHordeRequestPayload(payload);
        }

        super.dispatch(payload);
    }

    /**
     * Handles the "HordeRequestPayload" calling the Horde backend.
     *
     * @param payload Payload to dispatch
     *
     * @return Horde request promise instance
     * @since  v1.0.0
     */
    protected handleHordeRequestPayload(payload: HordeRequestPayload) {
        return (new HordeRequest(this, payload)).execute();
    }

    /**
     * Returns the Flux dispatcher singleton.
     *
     * @return Flux dispatcher instance
     * @since  v1.0.0
     */
    public static getInstance<P extends Payload = Payload>() {
        if (!this.dispatcher) {
            this.dispatcher = new Dispatcher<P>();
        }

        return this.dispatcher;
    }
}
