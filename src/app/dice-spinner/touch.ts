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

/* Implements very basic touch tracking. This class tracks a single touch
 * gesture at a time, firing callbacks for start, end and in-between
 * touch events. Once a touch gesture is started, all subsequent gestures
 * will be ignored until the first gesture is stopped. */
export class TouchControl
{
    viewport : HTMLElement
    activeTouch : TrackedTouch = null;

    start : EventEmitter<any> = new EventEmitter();
    stop : EventEmitter<any> = new EventEmitter();
    move : EventEmitter<any> = new EventEmitter();

    private stopActiveTouch()
    {
        this.stop.emit({
            x: this.activeTouch.x,
            y: this.activeTouch.y,
        });
        this.activeTouch = null;
    }

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
                    x: touch.clientX,
                    y : touch.clientY,
                };
                this.start.emit({
                    x: this.activeTouch.x,
                    y: this.activeTouch.y,
                });
                break;
            }

        }, false);

        this.viewport.addEventListener('touchend', event => {
            for (let touch of <any>event.changedTouches)
            {
                if (this.activeTouch && this.activeTouch.identifier === touch.identifier)
                {
                    this.stopActiveTouch();
                    break;
                }
            }
        }, false);

        this.viewport.addEventListener('touchcancel', event => {
            for (let touch of <any>event.changedTouches)
            {
                if (this.activeTouch && this.activeTouch.identifier === touch.identifier)
                {
                    this.stopActiveTouch();
                    break;
                }
            }
        }, false);

        this.viewport.addEventListener('touchmove', event => {
            for (let touch of <any>event.changedTouches)
            {
                if (this.activeTouch && touch.identifier === this.activeTouch.identifier)
                {
                    this.activeTouch.x = touch.clientX;
                    this.activeTouch.y = touch.clientY;
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
