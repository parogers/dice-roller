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

import { TouchControl } from './touch';

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
    freeSpinning : boolean = false;

    constructor(
        private tray : HTMLElement
    )
    { }

    slideTray(delta : number)
    {
        const rect = this.tray.getBoundingClientRect();
        this.trayOffset += delta;

        if (-this.trayOffset > rect.width)
        {
            this.trayOffset += rect.width;
            this.tray.style.transform = 'translateX(' + this.trayOffset + 'px)';

            const tile = this.tray.querySelector('div');
            this.tray.removeChild(tile);
            this.tray.appendChild(tile);
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
        this.estimator.reset();
    }

    stopDrag(pos)
    {
        if (this.freeSpinning) {
            return;
        }
        this.slideTray(pos - this.lastDragPos);

        this.freeSpinning = true;
        let callback = () => {
            const dt = 25;
            this.estimator.velocity *= 0.98;

            this.slideTray(this.estimator.velocity*(dt/1000.0));

            if (Math.abs(this.estimator.velocity) > 10) {
                setTimeout(callback, dt);
            } else {
                this.freeSpinning = false;
            }
        };
        callback();
    }

    drag(pos : number)
    {
        if (!this.freeSpinning) {
            // const x = this.trayOffset + pos - this.startDragPos;
            // this.tray.style.transform = 'translateX(' + x + 'px)';
            this.slideTray(pos - this.lastDragPos);
        }

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

    touchCtrl : TouchControl;

    constructor()
    {
        this.touchCtrl = new TouchControl();
        this.touchCtrl.start.subscribe(event => {
            this.spinner.startDrag(event.x);
        });
        this.touchCtrl.stop.subscribe(event =>{
            this.spinner.stopDrag(event.x);
        });
        this.touchCtrl.move.subscribe(event => {
            this.spinner.drag(event.x);
        });
    }

    get tray() : HTMLElement
    {
        return this.trayView.nativeElement;
    }

    get viewport() : HTMLElement
    {
        return this.viewportView.nativeElement;
    }

    ngOnInit(): void
    {
        this.spinner = new Spinner(this.tray);
        this.touchCtrl.attach(this.viewportView.nativeElement);
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
