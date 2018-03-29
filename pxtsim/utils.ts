namespace pxsim.util {
    export function injectPolyphils() {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
        if (!Array.prototype.fill) {
            Object.defineProperty(Array.prototype, 'fill', {
                writable: true,
                enumerable: true,
                value: function (value: Array<any>) {

                    // Steps 1-2.
                    if (this == null) {
                        throw new TypeError('this is null or not defined');
                    }

                    let O = Object(this);

                    // Steps 3-5.
                    let len = O.length >>> 0;

                    // Steps 6-7.
                    let start = arguments[1];
                    let relativeStart = start >> 0;

                    // Step 8.
                    let k = relativeStart < 0 ?
                        Math.max(len + relativeStart, 0) :
                        Math.min(relativeStart, len);

                    // Steps 9-10.
                    let end = arguments[2];
                    let relativeEnd = end === undefined ?
                        len : end >> 0;

                    // Step 11.
                    let final = relativeEnd < 0 ?
                        Math.max(len + relativeEnd, 0) :
                        Math.min(relativeEnd, len);

                    // Step 12.
                    while (k < final) {
                        O[k] = value;
                        k++;
                    }

                    // Step 13.
                    return O;
                }
            });
        }
        // Polyfill for Uint8Array.slice for IE and Safari
        // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.slice
        // TODO: Move this polyfill to a more appropriate file. It is left here for now because moving it causes a crash in IE; see PXT issue #1301.
        if (!Uint8Array.prototype.slice) {
            Object.defineProperty(Uint8Array.prototype, 'slice', {
                value: Array.prototype.slice,
                writable: true,
                enumerable: true
            });
        }
        if (!Uint16Array.prototype.slice) {
            Object.defineProperty(Uint16Array.prototype, 'slice', {
                value: Array.prototype.slice,
                writable: true,
                enumerable: true
            });
        }
        if (!Uint32Array.prototype.slice) {
            Object.defineProperty(Uint32Array.prototype, 'slice', {
                value: Array.prototype.slice,
                writable: true,
                enumerable: true
            });
        }
        // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.fill
        if (!Uint8Array.prototype.fill) {
            Object.defineProperty(Uint8Array.prototype, 'fill', {
                value: Array.prototype.fill,
                writable: true,
                enumerable: true
            });
        }
        if (!Uint16Array.prototype.fill) {
            Object.defineProperty(Uint16Array.prototype, 'fill', {
                value: Array.prototype.fill,
                writable: true,
                enumerable: true
            });
        }
        if (!Uint32Array.prototype.fill) {
            Object.defineProperty(Uint32Array.prototype, 'fill', {
                value: Array.prototype.fill,
                writable: true,
                enumerable: true
            });
        }
    }

    export class Lazy<T> {
        private _value: T;
        private _evaluated = false;

        constructor(private _func: () => T) { }

        get value(): T {
            if (!this._evaluated) {
                this._value = this._func();
                this._evaluated = true;
            }
            return this._value;
        }
    }

    export function getNormalizedParts(path: string): string[] {
        path = path.replace(/\\/g, "/");

        const parts: string[] = [];
        path.split("/").forEach(part => {
            if (part === ".." && parts.length) {
                parts.pop();
            }
            else if (part && part !== ".") {
                parts.push(part)
            }
        });

        return parts;
    }

    export function normalizePath(path: string): string {
        return getNormalizedParts(path).join("/");
    }

    export function relativePath(fromDir: string, toFile: string): string {
        const fParts = getNormalizedParts(fromDir);
        const tParts = getNormalizedParts(toFile);

        let i = 0;
        while (fParts[i] === tParts[i]) {
            i++;
            if (i === fParts.length || i === tParts.length) {
                break;
            }
        }

        const fRemainder = fParts.slice(i);
        const tRemainder = tParts.slice(i);
        for (let i = 0; i < fRemainder.length; i++) {
            tRemainder.unshift("..");
        }

        return tRemainder.join("/");
    }

    export function pathJoin(...paths: string[]): string {
        let result = "";
        paths.forEach(path => {
            path.replace(/\\/g, "/");
            if (path.lastIndexOf("/") === path.length - 1) {
                path = path.slice(0, path.length - 1)
            }
            result += "/" + path;
        });
        return result;
    }
}