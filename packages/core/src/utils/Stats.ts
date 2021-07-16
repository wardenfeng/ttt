import { objectIsEmpty } from '@feng3d/polyfill';
import { ticker } from "./Ticker";

declare global
{
    interface Performance
    {
        memory: any;
    }
}

export class Stats
{
    static instance: Stats;
    static init(parent?: HTMLElement)
    {
        if (!this.instance)
        {
            this.instance = new Stats();
            parent = parent || document.body;
            parent.appendChild(this.instance.dom);
        }
        ticker.onframe(this.instance.update, this.instance);
    }

    REVISION: number;
    dom: HTMLDivElement;
    domElement: HTMLDivElement;
    addPanel: (panel: StatsPanel) => StatsPanel;
    showPanel: (id: number) => void;
    setMode: (id: number) => void;
    begin: () => void;
    end: () => number;
    update: () => void;

    constructor()
    {
        var mode = 0;
        if (typeof document === "undefined") return;

        var container = document.createElement('div');
        container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;';
        container.addEventListener('click', function (event)
        {
            event.preventDefault();
            showPanel(++mode % container.children.length);
        }, false);

        //
        function addPanel(panel: StatsPanel)
        {
            container.appendChild(panel.dom);
            return panel;
        }

        function showPanel(id: number)
        {
            for (var i = 0; i < container.children.length; i++)
            {
                (container.children[i] as HTMLCanvasElement).style.display = i === id ? 'block' : 'none';
            }
            mode = id;
        }

        //
        var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;

        var fpsPanel = addPanel(new StatsPanel('FPS', '#0ff', '#002'));
        var msPanel = addPanel(new StatsPanel('MS', '#0f0', '#020'));

        if (self.performance && self.performance.memory)
        {
            var memPanel = addPanel(new StatsPanel('MB', '#f08', '#201'));
        }

        showPanel(0);

        this.REVISION = 16;
        this.dom = container;
        this.addPanel = addPanel;
        this.showPanel = showPanel;

        this.begin = () =>
        {
            beginTime = (performance || Date).now();
        }

        this.end = () =>
        {
            frames++;
            var time = (performance || Date).now();
            msPanel.update(time - beginTime, 200);
            if (time > prevTime + 1000)
            {
                fpsPanel.update((frames * 1000) / (time - prevTime), 100);
                prevTime = time;
                frames = 0;
                if (memPanel)
                {
                    var memory = performance.memory;
                    memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
                }
            }
            return time;
        }

        this.update = () =>
        {
            beginTime = this.end();
        }

        // Backwards Compatibility

        this.domElement = container;
        this.setMode = showPanel;
    };
}

export class StatsPanel
{
    dom: HTMLCanvasElement;
    update: (value: number, maxValue: number) => void;

    constructor(name: string, fg: string, bg: string)
    {
        var min = Infinity, max = 0, round = Math.round;
        var PR = round(window.devicePixelRatio || 1);

        var WIDTH = 80 * PR, HEIGHT = 48 * PR,
            TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
            GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
            GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

        var canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.cssText = 'width:80px;height:48px';

        var context0 = canvas.getContext('2d');
        if (objectIsEmpty(context0))
        {
            console.log(`无法创建 CanvasRenderingContext2D `);
            return;
        }
        var context = context0;
        context.font = 'bold ' + (9 * PR) + 'px Helvetica,Arial,sans-serif';
        context.textBaseline = 'top';

        context.fillStyle = bg;
        context.fillRect(0, 0, WIDTH, HEIGHT);

        context.fillStyle = fg;
        context.fillText(name, TEXT_X, TEXT_Y);
        context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

        this.dom = canvas;

        this.update = (value: number, maxValue: number) =>
        {
            min = Math.min(min, value);
            max = Math.max(max, value);

            context.fillStyle = bg;
            context.globalAlpha = 1;
            context.fillRect(0, 0, WIDTH, GRAPH_Y);
            context.fillStyle = fg;
            context.fillText(round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')', TEXT_X, TEXT_Y);

            context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);

            context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

            context.fillStyle = bg;
            context.globalAlpha = 0.9;
            context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - (value / maxValue)) * GRAPH_HEIGHT));
        }
    }
}
