namespace _Components {

    export interface IBaseComponent {
        data(): Object;
        on(name: string, callback: Function, ctx: any): void;
        fire(name: string, ...args: any[]): void;
        options: IBaseComponentOptions;
        set(data: Object): void;
    }
    
    export interface IBaseComponentOptions {
        target: HTMLElement;
        data?: any;
    }

    export class BaseComponent implements IBaseComponent {

        public options: IBaseComponentOptions;
        protected _$element: JQuery;
        private _e: any;

        constructor(options: IBaseComponentOptions) {
            this.options = options;
            this.options.data = $.extend(this.data(), options.data);
        }

        protected _init(): boolean {
            this._$element = $(this.options.target);

            if (!this._$element.length) {
                console.warn('element not found');
                return false;
            }

            this._$element.empty();

            return true;
        }

        public data(): Object {
            return {};
        }

        public on(name: string, callback: Function, ctx: any): void {
            var e = this._e || (this._e = {});

            (e[name] || (e[name] = [])).push({
                fn: callback,
                ctx: ctx
            });
        }

        public fire(name: string, ...args: any[]): void {
            var data = [].slice.call(arguments, 1);
            var evtArr = ((this._e || (this._e = {}))[name] || []).slice();
            var i = 0;
            var len = evtArr.length;

            for (i; i < len; i++) {
                evtArr[i].fn.apply(evtArr[i].ctx, data);
            }
        }

        protected _resize(): void {

        }

        public set(data: Object): void {

        }
    }
}

interface Window {
    _Components: any;
}

(function(g: any) {
    if (!g._Components){
        g._Components = _Components;
    }
})(window);
