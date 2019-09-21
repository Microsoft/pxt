namespace pxt.blocks {
    export interface DiffOptions {
        hideUnmodifiedTopBlocks?: boolean;
    }

    export interface DiffResult {
        ws?: Blockly.WorkspaceSvg;
        error?: any;
        svg?: Element;
        deleted: number;
        added: number;
        modified: number;
    }

    export function diffXml(oldXml: string, newXml: string, options?: DiffOptions): DiffResult {
        const oldWs = pxt.blocks.loadWorkspaceXml(oldXml, true);
        const newWs = pxt.blocks.loadWorkspaceXml(newXml, true);
        return diff(oldWs, newWs, options);
    }

    export function diff(oldWs: Blockly.Workspace, newWs: Blockly.Workspace, options?: DiffOptions): DiffResult {
        Blockly.Events.disable();
        try {
            return diffNoEvents(oldWs, newWs, options);
        }
        catch (e) {
            pxt.reportException(e);
            return {
                ws: undefined,
                error: e,
                deleted: 0,
                added: 0,
                modified: 0
            }
        } finally {
            Blockly.Events.enable();
        }
    }

    const ADD_IMAGE_DATAURI =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0icmVwZWF0IgogICB4PSIwcHgiCiAgIHk9IjBweCIKICAgdmlld0JveD0iMCAwIDI0IDI0IgogICBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNCAyNDsiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTEgcjEzNzI1IgogICBzb2RpcG9kaTpkb2NuYW1lPSJhZGQuc3ZnIj48bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGExNSI+PHJkZjpSREY+PGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPjxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PjxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz48ZGM6dGl0bGU+cmVwZWF0PC9kYzp0aXRsZT48L2NjOldvcms+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnMKICAgICBpZD0iZGVmczEzIiAvPjxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBwYWdlY29sb3I9IiNmZjQ4MjEiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBvYmplY3R0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTY4MCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI5NjkiCiAgICAgaWQ9Im5hbWVkdmlldzExIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIxOS42NjY2NjciCiAgICAgaW5rc2NhcGU6Y3g9IjEyLjkxNTI1NCIKICAgICBpbmtzY2FwZTpjeT0iMTYuMDY3Nzk2IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIwIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjAiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0icmVwZWF0IiAvPjxzdHlsZQogICAgIHR5cGU9InRleHQvY3NzIgogICAgIGlkPSJzdHlsZTMiPgoJLnN0MHtmaWxsOiNDRjhCMTc7fQoJLnN0MXtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPjx0aXRsZQogICAgIGlkPSJ0aXRsZTUiPnJlcGVhdDwvdGl0bGU+PHJlY3QKICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MTtzdHJva2UtbGluZWNhcDpzcXVhcmU7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MC4wNzg0MzEzNyIKICAgICBpZD0icmVjdDQxNDMiCiAgICAgd2lkdGg9IjQuMDUwMDAwMiIKICAgICBoZWlnaHQ9IjEyLjM5NzA1IgogICAgIHg9IjkuOTc1MDAwNCIKICAgICB5PSItMTguMTk4NTI2IgogICAgIHJ4PSIwLjgxIgogICAgIHJ5PSIwLjgxIgogICAgIHRyYW5zZm9ybT0ic2NhbGUoMSwtMSkiIC8+PHJlY3QKICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MTtzdHJva2UtbGluZWNhcDpzcXVhcmU7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MC4wNzg0MzEzNyIKICAgICBpZD0icmVjdDQxNDMtMSIKICAgICB3aWR0aD0iNC4wNTAwMDAyIgogICAgIGhlaWdodD0iMTIuMzk3MTE5IgogICAgIHg9IjkuOTc1MDAwNCIKICAgICB5PSI1LjgwMTQ0MDciCiAgICAgcng9IjAuODEiCiAgICAgcnk9IjAuODEiCiAgICAgdHJhbnNmb3JtPSJtYXRyaXgoMCwxLDEsMCwwLDApIiAvPjxjaXJjbGUKICAgICBzdHlsZT0ib3BhY2l0eToxO2ZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6I2ZmZmZmZjtzdHJva2Utd2lkdGg6MjtzdHJva2UtbGluZWNhcDpzcXVhcmU7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICBpZD0icGF0aDQxMzYiCiAgICAgY3g9IjEyIgogICAgIGN5PSIxMiIKICAgICByPSIxMC41MDMxOTEiIC8+PC9zdmc+';
    function diffNoEvents(oldWs: Blockly.Workspace, newWs: Blockly.Workspace, options?: DiffOptions): DiffResult {
        options = options || {};
        const oldXml = pxt.blocks.saveWorkspaceXml(oldWs, true);
        const newXml = pxt.blocks.saveWorkspaceXml(newWs, true);

        if (oldXml == newXml) {
            return {
                ws: undefined,
                added: 0,
                deleted: 0,
                modified: 0
            }; // no changes
        }
        const trashWs = new Blockly.Workspace();

        // we'll ignore disabled blocks in the final output

        const oldBlocks = oldWs.getAllBlocks().filter(b => !b.disabled);
        const oldTopBlocks = oldWs.getTopBlocks(false).filter(b => !b.disabled);
        const newBlocks = newWs.getAllBlocks().filter(b => !b.disabled);
        console.log(`blocks`, newBlocks.map(b => b.id));
        console.log(newBlocks)

        // locate deleted and added blocks
        const deletedTopBlocks = oldTopBlocks.filter(b => !newWs.getBlockById(b.id));
        const deletedBlocks = oldBlocks.filter(b => !newWs.getBlockById(b.id));
        const addedBlocks = newBlocks.filter(b => !oldWs.getBlockById(b.id));

        // clone new workspace into rendering workspace
        const ws = pxt.blocks.initRenderingWorkspace();
        pxt.blocks.domToWorkspaceNoEvents(Blockly.Xml.textToDom(newXml), ws);

        // delete disabled blocks from final workspace
        ws.getAllBlocks().filter(b => b.disabled).forEach(b => {
            console.log('disabled:', b.id)
            b.dispose(false)
        })
        const todoBlocks = Util.toDictionary(ws.getAllBlocks(), b => b.id);
        log('start')

        // 1. deleted top blocks
        deletedTopBlocks.forEach(b => {
            console.log(`deleted top ${b.id}`)
            done(b);
            const b2 = cloneIntoDiff(b);
            done(b2);
            b2.setDisabled(true);
        });
        log('deleted top')

        // 2. added blocks
        addedBlocks.map(b => ws.getBlockById(b.id)).forEach(b => {
            console.log(`added top ${b.id}`)
            b.inputList[0].insertFieldAt(0, new Blockly.FieldImage(ADD_IMAGE_DATAURI, 24, 24, false));
            done(b);
        });
        log('added top')

        // 3. delete statement blocks
        // TODO

        // 4. moved blocks
        let modified = 0;
        Util.values(todoBlocks).filter(b => moved(b)).forEach(b => {
            console.log(`moved ${b.id}`)
            delete todoBlocks[b.id]
            markUsed(b);
            modified++;
        })
        log('moved')

        // 5. blocks with field properties that changed
        Util.values(todoBlocks).filter(b => changed(b)).forEach(b => {
            console.log(`changed ${b.id}`)
            delete todoBlocks[b.id];
            markUsed(b);
            modified++;
        })
        log('changed')

        // delete unmodified top blocks
        if (!options.hideUnmodifiedTopBlocks) {
            ws.getTopBlocks(false)
                .filter(b => !find(b, c => isUsed(c)))
                .forEach(b => {
                    console.log(`unmodified ${b.id}`)
                    delete todoBlocks[b.id];
                    b.dispose(false)
                });
            log('cleaned')
        }

        // all unmodifed blocks are greyed out
        Util.values(todoBlocks).filter(b => !!ws.getBlockById(b.id)).forEach(b => {
            b.setColour("#c0c0c0")
            forceRender(b);
        });

        // make sure everything is rendered
        ws.resize();
        Blockly.svgResize(ws);

        // final render
        const svg = pxt.blocks.renderWorkspace({
        });

        // and we're done
        return {
            ws,
            svg: svg,
            deleted: deletedBlocks.length,
            added: addedBlocks.length,
            modified: modified
        }

        function markUsed(b: Blockly.Block) {
            (<any>b).___used = true;
        }

        function isUsed(b: Blockly.Block) {
            return !!(<any>b).___used;
        }

        function cloneIntoDiff(b: Blockly.Block): Blockly.Block {
            const bdom = Blockly.Xml.blockToDom(b, false);
            const b2 = Blockly.Xml.domToBlock(bdom, ws);
            return b2;
        }

        function forceRender(b: Blockly.Block) {
            const a = <any>b;
            a.rendered = false;
            b.inputList.forEach(i => i.fieldRow.forEach(f => {
                f.init();
                if (f.box_) {
                    f.box_.setAttribute('fill', b.getColour())
                    f.box_.setAttribute('stroke', b.getColourTertiary())
                }
            }));
        }

        function done(b: Blockly.Block) {
            vis(b, t => { delete todoBlocks[t.id]; markUsed(t); });
        }

        function vis(b: Blockly.Block, f: (b: Blockly.Block) => void) {
            f(b);
            const children = b.getChildren(false);
            if (children)
                children.forEach(c => vis(c, f));
        }

        function find(b: Blockly.Block, f: (b: Blockly.Block) => boolean): boolean {
            if (f(b)) return true;
            const children = b.getChildren(false);
            if (children && children.find(c => find(c, f)))
                return true;
            return false;
        }

        function log(msg: string) {
            console.log(`${msg}:`, Object.keys(todoBlocks))
        }

        function moved(b: Blockly.Block) {
            const oldb = oldWs.getBlockById(b.id); // extra block created in added step
            if (!oldb)
                return false;

            const newPrevious = b.getPreviousBlock();
            // connection already already processed
            if (newPrevious && !todoBlocks[newPrevious.id])
                return false;
            const newNext = b.getNextBlock();
            // already processed
            if (newNext && !todoBlocks[newNext.id])
                return false;

            const oldPrevious = oldb.getPreviousBlock();
            if (!oldPrevious && !newPrevious) return false; // no connection
            if (!!oldPrevious != !!newPrevious // new connection
                || oldPrevious.id != newPrevious.id) // new connected blocks
                return true;
            const oldNext = oldb.getNextBlock();
            if (!oldNext && !newNext) return false; // no connection
            if (!!oldNext != !!newNext // new connection
                || oldNext.id != newNext.id) // new connected blocks
                return true;
            return false;
        }

        function changed(b: Blockly.Block) {
            let oldb = oldWs.getBlockById(b.id); // extra block created in added step
            if (!oldb)
                return false;

            // normalize
            oldb = normalize(oldb);
            b = normalize(b);

            //diff
            const oldText = normalizedDom(oldb);
            const newText = normalizedDom(b);

            if (oldText != newText) {
                console.log(`old`, oldText)
                console.log(`new`, newText)
                return true;
            }
            // not changed!
            return false;
        }

        function normalize(b: Blockly.Block): Blockly.Block {
            const dom = Blockly.Xml.blockToDom(b);
            let sb = Blockly.Xml.domToBlock(dom, trashWs);
            // disconnect is broken.. patch up the dom later on
            return sb;
        }

        function normalizedDom(b: Blockly.Block): string {
            const dom = Blockly.Xml.blockToDom(b, true);
            visDom(dom, (e) => {
                e.removeAttribute("deletable");
                e.removeAttribute("editable");
                e.removeAttribute("movable")
                if (e.localName == "next")
                    e.remove(); // disconnect or unplug not working propertly
                if (e.localName == "statement")
                    e.remove();
            })
            return Blockly.Xml.domToText(dom);
        }

        function visDom(el: Element, f: (e: Element) => void) {
            if (!el) return;
            f(el);
            for (const child of Util.toArray(el.children))
                visDom(child, f);
        }
    }
}