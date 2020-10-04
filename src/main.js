
var pendingTouch = null;
var velocity = 0;
var startTrayX = 0;
var startX = 0;
var lastClientX = 0;
var lastTime = 0;
var rect;
var tray;
var viewport;

function setupTouch()
{
    viewport.addEventListener('touchstart', event => {
        event.preventDefault();

        if (pendingTouch !== null) {
            return;
        }

        for (let touch of event.changedTouches)
        {
            pendingTouch = {
                identifier: touch.identifier,
                x: touch.pageX,
                y : touch.pageY,
            };
            mouseDown(pendingTouch.x, pendingTouch.y);
            break;
        }

    }, false);

    viewport.addEventListener('touchend', () => {
        if (pendingTouch !== null)
        {
            mouseUp(pendingTouch.x, pendingTouch.y);
            pendingTouch = null;
        }
    }, false);

    viewport.addEventListener('touchcancel', () => {
        if (pendingTouch !== null)
        {
            mouseUp(pendingTouch.x, pendingTouch.y);
            pendingTouch = null;
        }
    }, false);

    viewport.addEventListener('touchmove', event => {
        for (let touch of event.changedTouches)
        {
            if (pendingTouch && touch.identifier === pendingTouch.identifier)
            {
                pendingTouch.x = touch.pageX;
                pendingTouch.y = touch.pageY;
                mouseMove(pendingTouch.x, pendingTouch.y);
                break;
            }
        }
    }, false);
}

function millis()
{
    return (new Date()).getTime()/1000.0;
}

function mouseMove(eventX, eventY)
{
    const now = millis();
    const x = startTrayX + eventX - startX;
    tray.style.transform = 'translateX(' + x + 'px)';

    if (lastClientX !== null) {
        const w = 0.50;
        velocity = w*velocity + (1-w)*(eventX - lastClientX) / (now - lastTime);
    }

    lastClientX = eventX;
    lastTime = now;
}

function mouseDown(eventX, eventY)
{
    startX = eventX;
    lastTime = millis();
    lastClientX = null;
    velocity = 0;
}

function mouseUp(eventX, eventY)
{
    setTrayX(startTrayX + eventX - startX);

    let callback = () => {
        const delay = 25;
        velocity *= 0.98;

        setTrayX(startTrayX + velocity*(delay/1000.0));
        tray.style.transform = 'translateX(' + startTrayX + 'px)';

        if (Math.abs(velocity) > 10) {
            setTimeout(callback, delay);
        }
    };
    callback();
}

function loaded()
{
    console.log('loaded');

    tray = document.getElementById('tray');

    viewport = document.getElementById('viewport');
    rect = viewport.getBoundingClientRect();

    setupTouch();

    viewport.addEventListener('mousemove', event => {
        if (event.buttons === 1)
        {
            mouseMove(event.clientX, event.clientY);
        }
    });

    viewport.addEventListener('mousedown', event => {
        mouseDown(event.clientX, event.clientY);
    });

    viewport.addEventListener('mouseup', event => {
        mouseUp(event.clientX, event.clientY);
    });
}

function setTrayX(value)
{
    startTrayX = value;

    if (-startTrayX > rect.width)
    {
        startTrayX += rect.width;
        tray.style.transform = 'translateX(' + startTrayX + 'px)';

        const tile = tray.querySelector('div');
        tray.removeChild(tile);
        tray.appendChild(tile);
    }
}
