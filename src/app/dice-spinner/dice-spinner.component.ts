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

    startX : number;
    lastTime : number;
    lastClientX : number = -1;
    velocity : number;
    startTrayX : number = 0;

    constructor() { }

    get tray() : HTMLElement
    {
        return this.trayView.nativeElement;
    }

    ngOnInit(): void {
    }

    setTrayX(value : number)
    {
        const rect = this.tray.getBoundingClientRect();
        this.startTrayX = value;

        if (-this.startTrayX > rect.width)
        {
            this.startTrayX += rect.width;
            this.tray.style.transform = 'translateX(' + this.startTrayX + 'px)';

            const tile = this.tray.querySelector('div');
            this.tray.removeChild(tile);
            this.tray.appendChild(tile);
        }
    }

    handleMouseMove(event)
    {
        if (event.buttons === 1)
        {
            const now = millis();
            const x = this.startTrayX + event.clientX - this.startX;
            this.tray.style.transform = 'translateX(' + x + 'px)';

            // if (this.lastClientX !== null) {
            //     const w = 0.50;
            //     velocity = w*velocity + (1-w)*(eventX - lastClientX) / (now - lastTime);
            // }

            this.lastClientX = event.clientX;
            this.lastTime = now;
        }
    }

    handleMouseUp(event)
    {
        this.setTrayX(this.startTrayX + event.clientX - this.startX);
        //
        // let callback = () => {
        //     const delay = 25;
        //     velocity *= 0.98;
        //
        //     setTrayX(startTrayX + velocity*(delay/1000.0));
        //     tray.style.transform = 'translateX(' + startTrayX + 'px)';
        //
        //     if (Math.abs(velocity) > 10) {
        //         setTimeout(callback, delay);
        //     }
        // };
        // callback();
    }

    handleMouseDown(event)
    {
        this.startX = event.clientX;
        this.lastTime = millis();
        this.lastClientX = null;
        this.velocity = 0;
    }
}
