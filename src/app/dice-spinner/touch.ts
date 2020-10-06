/*
 * Dice roller - An app for rolling dice.
 * Copyright (C) 2020  Peter Rogers (peter.rogers@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { EventEmitter } from '@angular/core';

export interface TrackedTouch
{
    identifier: number;
    x: number;
    y: number;
}

export class TouchControl
{
    viewport : HTMLElement
    pendingTouch : TrackedTouch;

    start : EventEmitter<any> = new EventEmitter();
    stop : EventEmitter<any> = new EventEmitter();
    move : EventEmitter<any> = new EventEmitter();

    attach(viewport : HTMLElement)
    {
        this.viewport = viewport;

        this.viewport.addEventListener('touchstart', event => {
            event.preventDefault();

            if (this.pendingTouch !== null) {
                return;
            }

            for (let touch of <any>event.changedTouches)
            {
                this.pendingTouch = {
                    identifier: touch.identifier,
                    x: touch.pageX,
                    y : touch.pageY,
                };
                this.start.emit({
                    x: this.pendingTouch.x,
                    y: this.pendingTouch.y,
                });
                // mouseDown(pendingTouch.x, pendingTouch.y);
                break;
            }

        }, false);

        this.viewport.addEventListener('touchend', () => {
            if (this.pendingTouch !== null)
            {
                // mouseUp(pendingTouch.x, pendingTouch.y);
                this.stop.emit({
                    x: this.pendingTouch.x,
                    y: this.pendingTouch.y,
                });
                this.pendingTouch = null;
            }
        }, false);

        this.viewport.addEventListener('touchcancel', () => {
            if (this.pendingTouch !== null)
            {
                // mouseUp(pendingTouch.x, pendingTouch.y);
                this.stop.emit({
                    x: this.pendingTouch.x,
                    y: this.pendingTouch.y,
                });
                this.pendingTouch = null;
            }
        }, false);

        this.viewport.addEventListener('touchmove', event => {
            for (let touch of <any>event.changedTouches)
            {
                if (this.pendingTouch && touch.identifier === this.pendingTouch.identifier)
                {
                    this.pendingTouch.x = touch.pageX;
                    this.pendingTouch.y = touch.pageY;
                    // mouseMove(pendingTouch.x, pendingTouch.y);
                    this.stop.emit({
                        x: this.pendingTouch.x,
                        y: this.pendingTouch.y,
                    });
                    break;
                }
            }
        }, false);
    }

}
