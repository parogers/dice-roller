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
import { Component, OnInit, ViewChild } from '@angular/core';

function time()
{
    return (new Date()).getTime()/1000.0;
}

class VelocityEstimator
{
    velocity : number = 0;
    lastTime : number = -1;
    lastPos : number = 0;

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

class Spinner
{
    estimator = new VelocityEstimator();
    startDragPos : number;
    lastDragPos : number = -1;
    trayOffset : number = 0;
    // lastTime : number;
    // velocity : number;

    constructor(
        private tray : HTMLElement
    )
    { }

    setTrayX(value : number)
    {
        const rect = this.tray.getBoundingClientRect();
        this.trayOffset = value;

        if (-this.trayOffset > rect.width)
        {
            this.trayOffset += rect.width;
            this.tray.style.transform = 'translateX(' + this.trayOffset + 'px)';

            const tile = this.tray.querySelector('div');
            this.tray.removeChild(tile);
            this.tray.appendChild(tile);
        }
    }

    startDrag(pos)
    {
        this.startDragPos = pos;
        this.lastDragPos = -1;
        this.velocity = 0;
        this.estimator.reset();
    }

    stopDrag(pos)
    {
        this.setTrayX(this.trayOffset + pos - this.startDragPos);
        console.log(this.estimator.velocity);
        //
        // let callback = () => {
        //     const delay = 25;
        //     velocity *= 0.98;
        //
        //     setTrayX(trayOffset + velocity*(delay/1000.0));
        //     tray.style.transform = 'translateX(' + trayOffset + 'px)';
        //
        //     if (Math.abs(velocity) > 10) {
        //         setTimeout(callback, delay);
        //     }
        // };
        // callback();
    }

    drag(pos : number)
    {
        const x = this.trayOffset + pos - this.startDragPos;
        this.tray.style.transform = 'translateX(' + x + 'px)';
        this.lastDragPos = pos;
        this.estimator.update(pos, time());
    }
}

@Component({
    selector: 'app-dice-spinner',
    templateUrl: './dice-spinner.component.html',
    styleUrls: ['./dice-spinner.component.scss']
})
export class DiceSpinnerComponent implements OnInit
{
    @ViewChild('viewport', { static: true})
    viewportView : any;

    @ViewChild('tray', { static: true})
    trayView : any;

    spinner : Spinner;

    constructor() { }

    get tray() : HTMLElement
    {
        return this.trayView.nativeElement;
    }

    ngOnInit(): void
    {
        this.spinner = new Spinner(this.tray);
    }

    handleMouseMove(event)
    {
        if (event.buttons === 1)
        {
            this.spinner.drag(event.clientX);
        }
    }

    handleMouseUp(event)
    {
        this.spinner.stopDrag(event.clientX);
    }

    handleMouseDown(event)
    {
        this.spinner.startDrag(event.clientX);
    }
}
