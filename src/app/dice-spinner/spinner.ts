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

// The maximum spin speed in pixels per second
// TODO - change this to viewport widths per second
const MAX_SPEED = 7500;

function time()
{
    return (new Date()).getTime()/1000.0;
}

/* Return the given velocity clamped to a maximum speed */
function clampVelocity(velocity : number, maxSpeed : number)
{
    return Math.sign(velocity) * Math.min(
        Math.abs(velocity),
        maxSpeed,
    );
}

class VelocityEstimator
{
    velocity : number = 0;
    lastTime : number = -1;
    lastPos : number = 0;

    constructor(
        private maxSpeed : number
    )
    { }

    reset()
    {
        this.velocity = 0;
        this.lastPos = 0;
        this.lastTime = -1;
    }

    update(pos : number, tm : number)
    {
        if (this.lastTime !== -1)
        {
            const w = 0.50;
            this.velocity = w*this.velocity + (1-w)*(pos - this.lastPos) / (tm - this.lastTime);
        }
        this.lastTime = tm;
        this.lastPos = pos;
    }
}

export class Spinner
{
    estimator = new VelocityEstimator(MAX_SPEED);
    startDragPos : number;
    lastDragPos : number = -1;
    trayOffset : number = 0;
    freeSpinning : boolean = false;
    magnet : boolean = false;

    constructor(
        private tray : HTMLElement
    )
    { }

    slideTrayTo(pos : number)
    {
        this.slideTray(pos - this.trayOffset);
    }

    slideTray(delta : number)
    {
        const rect = this.tray.getBoundingClientRect();
        this.trayOffset += delta;

        if (this.trayOffset < 0 && Math.abs(this.trayOffset) > rect.width)
        {
            // The second tile of the tray is now visible. So move the first
            // tile onto the end and shift the tray (offset) accordingly.
            this.trayOffset += rect.width;
            this.tray.style.transform = 'translateX(' + this.trayOffset + 'px)';

            const tile = this.tray.querySelector('div.tile');
            this.tray.removeChild(tile);
            this.tray.appendChild(tile);
        }
        else if (this.trayOffset >= 0)
        {
            // The space before the first tile is now visible. So move the last
            // tile of the tray to the beginning, and shift the tray (offset)
            // accordingly.
            this.trayOffset -= rect.width;
            this.tray.style.transform = 'translateX(' + this.trayOffset + 'px)';

            const first = this.tray.querySelector('div.tile');
            const tile = this.tray.querySelector('div.tile:last-child');
            this.tray.insertBefore(tile, first);
        }
        else
        {
            this.tray.style.transform = 'translateX(' + this.trayOffset + 'px)';
        }
    }

    startDrag(pos)
    {
        this.startDragPos = pos;
        this.lastDragPos = pos;
        this.magnet = false;
        this.freeSpinning = false;
    }

    stopDrag(pos)
    {
        if (this.freeSpinning) {
            return;
        }
        this.slideTray(pos - this.lastDragPos);
        this.engageFreeSpin();
    }

    drag(pos : number)
    {
        if (!this.freeSpinning) {
            this.slideTray(pos - this.lastDragPos);
        }

        this.lastDragPos = pos;
        this.estimator.update(pos, time());
    }

    engageFreeSpin()
    {
        if (this.freeSpinning) {
            return;
        }
        const rect = this.tray.getBoundingClientRect();

        this.magnet = false;
        this.freeSpinning = true;
        let callback = () => {
            const dt = 25;
            const magnetMaxSpeed = 500;

            if (!this.freeSpinning) {
                // User started dragging again
                return;
            }

            if (this.magnet)
            {
                // Calculate the closest tile edge to our current offset
                const nearestPos = rect.width*Math.round(this.trayOffset/rect.width);

                // Spinner is being "magnetically" drawn to a natural
                // stopping point.
                let accel = Math.sign(nearestPos - this.trayOffset) * 1000;

                // Slow down the tray quickly if it's heading in the wrong
                // direction. This has the effect of damping the speed as it
                // oscillates about it's final rest position.
                if (Math.sign(accel) != Math.sign(this.estimator.velocity)) {
                    accel *= 3;
                }

                this.estimator.velocity += accel*(dt/1000);
                this.estimator.velocity = clampVelocity(this.estimator.velocity, magnetMaxSpeed);

                if (Math.abs(this.estimator.velocity) < 50 &&
                    Math.abs(nearestPos - this.trayOffset) < 10)
                {
                    this.slideTrayTo(nearestPos);
                    this.freeSpinning = false;
                }
                else {
                    this.slideTray(this.estimator.velocity*(dt/1000.0));
                    setTimeout(callback, dt);
                }
            }
            else
            {
                const vel = clampVelocity(this.estimator.velocity, MAX_SPEED);

                // Spinning freely but slowing down gradually
                this.slideTray(vel*(dt/1000.0));

                if (Math.abs(vel) > magnetMaxSpeed)
                {
                    this.estimator.velocity *= 0.98;
                }
                else
                {
                    // Enagage "magnet mode"
                    this.magnet = true;
                }
                setTimeout(callback, dt);
            }
        };
        callback();
    }
}
