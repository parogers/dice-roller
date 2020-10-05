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

function millis()
{
    return (new Date()).getTime()/1000.0;
}

class SpeedEstimator
{
}

class Spinner
{
    startX : number;
    lastDragPos : number = -1;
    startTrayPos : number = 0;
    // lastTime : number;
    // velocity : number;

    constructor(
        private tray : HTMLElement
    )
    { }

    setTrayX(value : number)
    {
        const rect = this.tray.getBoundingClientRect();
        this.startTrayPos = value;

        if (-this.startTrayPos > rect.width)
        {
            this.startTrayPos += rect.width;
            this.tray.style.transform = 'translateX(' + this.startTrayPos + 'px)';

            const tile = this.tray.querySelector('div');
            this.tray.removeChild(tile);
            this.tray.appendChild(tile);
        }
    }

    startDrag(pos)
    {
        this.startX = pos;
        // this.lastTime = millis();
        this.lastDragPos = -1;
        this.velocity = 0;
    }

    stopDrag(pos)
    {
        this.setTrayX(this.startTrayPos + pos - this.startX);
        //
        // let callback = () => {
        //     const delay = 25;
        //     velocity *= 0.98;
        //
        //     setTrayX(startTrayPos + velocity*(delay/1000.0));
        //     tray.style.transform = 'translateX(' + startTrayPos + 'px)';
        //
        //     if (Math.abs(velocity) > 10) {
        //         setTimeout(callback, delay);
        //     }
        // };
        // callback();
    }

    drag(pos : number)
    {
        const now = millis();
        const x = this.startTrayPos + pos - this.startX;
        this.tray.style.transform = 'translateX(' + x + 'px)';

        // if (this.lastDragPos !== -1) {
        //     const w = 0.50;
        //     velocity = w*velocity + (1-w)*(eventX - lastDragPos) / (now - lastTime);
        // }

        this.lastDragPos = pos;
        // this.lastTime = now;
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
