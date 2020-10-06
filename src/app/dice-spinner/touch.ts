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
    activeTouch : TrackedTouch = null;

    start : EventEmitter<any> = new EventEmitter();
    stop : EventEmitter<any> = new EventEmitter();
    move : EventEmitter<any> = new EventEmitter();

    attach(viewport : HTMLElement)
    {
        this.viewport = viewport;

        this.viewport.addEventListener('touchstart', event => {
            event.preventDefault();

            // We only track one touch at a time
            if (this.activeTouch) {
                return;
            }

            for (let touch of <any>event.changedTouches)
            {
                this.activeTouch = {
                    identifier: touch.identifier,
                    x: touch.pageX,
                    y : touch.pageY,
                };
                this.start.emit({
                    x: this.activeTouch.x,
                    y: this.activeTouch.y,
                });
                // mouseDown(activeTouch.x, activeTouch.y);
                break;
            }

        }, false);

        this.viewport.addEventListener('touchend', () => {
            if (this.activeTouch)
            {
                // mouseUp(activeTouch.x, activeTouch.y);
                this.stop.emit({
                    x: this.activeTouch.x,
                    y: this.activeTouch.y,
                });
                this.activeTouch = null;
            }
        }, false);

        this.viewport.addEventListener('touchcancel', () => {
            if (this.activeTouch)
            {
                // mouseUp(activeTouch.x, activeTouch.y);
                this.stop.emit({
                    x: this.activeTouch.x,
                    y: this.activeTouch.y,
                });
                this.activeTouch = null;
            }
        }, false);

        this.viewport.addEventListener('touchmove', event => {
            for (let touch of <any>event.changedTouches)
            {
                if (this.activeTouch && touch.identifier === this.activeTouch.identifier)
                {
                    this.activeTouch.x = touch.pageX;
                    this.activeTouch.y = touch.pageY;
                    // mouseMove(activeTouch.x, activeTouch.y);
                    this.move.emit({
                        x: this.activeTouch.x,
                        y: this.activeTouch.y,
                    });
                    break;
                }
            }
        }, false);
    }

}
