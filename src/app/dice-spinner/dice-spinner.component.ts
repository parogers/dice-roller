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

import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { TouchControl } from './touch';

import { Spinner } from './spinner';

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

    @Input()
    faces : string[] = ['1', '2', '3', '4', '5', '6'];

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

        // const tiles = this.tray.querySelectorAll('.tile');
        // tiles.forEach((tile, index) => {
        //     if (index % 2 == 0) tile.classList.add('even');
        //     else tile.classList.add('odd');
        // });
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
