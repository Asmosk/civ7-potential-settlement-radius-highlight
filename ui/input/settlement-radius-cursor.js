/**
 * @file settlement radius cursor
 * @copyright 2025, Nyaka
 * @description Adds VFX to every tile in city radius around plot cursor
 */

import {PlotCursorUpdatedEventName} from '/core/ui/input/plot-cursor.js';
import {LensActivationEventName} from '/core/ui/lenses/lens-manager.js'

class SettlementRadiusCursorSingleton {
    static Instance;
    init = false;
    origin = {x: 0, y: 0, z: 0};
    modelGroup = null;
    _PlotCursorCoords = null;
    settlementRadius = 3;
    isEnabled = false;
    plotCursorUpdatedListener = this.onPlotCursorUpdated.bind(this);
    lensUpdatedListener = this.onLensUpdated.bind(this);

    constructor() {
        Loading.runWhenLoaded(() => this.initialize());
    }

    initialize() {
        this.startup();
    }

    startup() {
        if (!this.init) {
            engine.on("BeforeUnload", this.shutdown, this);
            window.addEventListener(PlotCursorUpdatedEventName, this.plotCursorUpdatedListener);
            window.addEventListener(LensActivationEventName, this.lensUpdatedListener)
            this.modelGroup = WorldUI.createModelGroup("settlementRadiusCursorModelGroup");
            this.init = true;
        }
    }

    shutdown() {
        if (this.init) {
            engine.off('BeforeUnload', this.shutdown, this);
            window.removeEventListener(PlotCursorUpdatedEventName, this.plotCursorUpdatedListener);
            window.removeEventListener(LensActivationEventName, this.lensUpdatedListener);
            if (this.modelGroup) {
                this.modelGroup.destroy();
                this.modelGroup = null;
            }
            this.init = false;
        }
    }

    /**
     * Singleton accessor
     */
    static getInstance() {
        if (!SettlementRadiusCursorSingleton.Instance) {
            SettlementRadiusCursorSingleton.Instance = new SettlementRadiusCursorSingleton();
        }
        return SettlementRadiusCursorSingleton.Instance;
    }

    set plotCursorCoords(coords) {
        if (coords == null && this._PlotCursorCoords == null) {
            return;
        } else if (this._PlotCursorCoords?.x === coords?.x && this._PlotCursorCoords?.y === coords?.y) {
            return;
        }
        this._PlotCursorCoords = coords;

        this.realizeFocusedPlot();
    }

    onPlotCursorUpdated(event) {
        if (event.detail?.plotCoords === null) return;``
        this.plotCursorCoords = event.detail.plotCoords;
    }

    onLensUpdated(event) {
        this.isEnabled = event.detail.activeLens === 'fxs-settler-lens' || event.detail.activeLens === 'fxs-founder-lens';
    }

    realizeFocusedPlot() {
        if (this.modelGroup) {
            this.modelGroup.clear();
            if (this._PlotCursorCoords && this.isEnabled) {
                for (let y = -this.settlementRadius; y <= this.settlementRadius; y++) {
                    let xcount = 2 * this.settlementRadius + 1 - Math.abs(y);
                    let xmin = -Math.floor(xcount / 2);
                    let xmax = Math.ceil(xcount / 2 - 1);
                    for (let x = xmin; x <= xmax; x++) {
                        let xoffset = (Math.abs(this._PlotCursorCoords.y) % 2) * (Math.abs(y) % 2);
                        this.modelGroup.addVFXAtPlot("VFX_3dUI_Tut_SelectThis_01", {
                            x: this._PlotCursorCoords.x + x + xoffset,
                            y: this._PlotCursorCoords.y + y
                        }, this.origin);
                    }
                }
            }
        }
    }
}

export const SettlementRadiusCursor = SettlementRadiusCursorSingleton.getInstance();
export {SettlementRadiusCursor as default};