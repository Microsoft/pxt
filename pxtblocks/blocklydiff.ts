namespace pxt.blocks {
    export interface DiffResult {
        ws?: Blockly.WorkspaceSvg;
        svg?: Element;
        deleted: number;
        added: number;
        modified: number;
    }

    export function diff(oldWs: Blockly.Workspace, newWs: Blockly.Workspace, options?: BlocksRenderOptions): DiffResult {
        const oldXml = pxt.blocks.saveWorkspaceXml(oldWs, true);
        const newXml = pxt.blocks.saveWorkspaceXml(newWs, true);

        if (oldXml == newXml) {
            return undefined; // no changes
        }

        const oldBlocks = oldWs.getAllBlocks();
        const oldTopBlocks = oldWs.getTopBlocks(false);
        const newBlocks = newWs.getAllBlocks();
        const newTopBlocks = newWs.getTopBlocks(false);
        console.log(`blocks`, newBlocks.map(b => b.id));
        console.log(newBlocks)

        // locate deleted and added blocks
        const deletedTopBlocks = oldTopBlocks.filter(b => !newWs.getBlockById(b.id));
        const deletedBlocks = oldBlocks.filter(b => !newWs.getBlockById(b.id));
        const addedTopBlocks = newTopBlocks.filter(b => !oldWs.getBlockById(b.id));
        const addedBlocks = newBlocks.filter(b => !oldWs.getBlockById(b.id));

        // clone new workspace into rendering workspace
        const ws = pxt.blocks.initRenderingWorkspace();
        pxt.blocks.domToWorkspaceNoEvents(Blockly.Xml.textToDom(newXml), ws);
        const todoBlocks = Util.toDictionary(ws.getAllBlocks(), b => b.id);
        log('start')

        // 1. deleted top blocks
        deletedTopBlocks.forEach(b => {
            console.log(`deleted top ${b.id}`)
            done(b);
            const bdom = Blockly.Xml.blockToDom(b, false);
            const b2 = Blockly.Xml.domToBlock(bdom, ws);
            col(b2, "#aa0000");
        });
        log('deleted top')

        // 2. added top blocks
        addedTopBlocks.map(b => ws.getBlockById(b.id)).forEach(b => {
            console.log(`added top ${b.id}`)
            done(b);
            col(b, "#00aa00");
        });
        log('added top')

        // 3. moved blocks
        Util.values(todoBlocks).filter(b => {
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
        }).forEach(b => {
            console.log(`moved ${b.id}`)
            b.setColour("#0000aa");
            delete todoBlocks[b.id]
        })
        log('moved')

        // all unmodifed blocks are greyed out
        Util.values(todoBlocks).forEach(b => b.setColour("#c0c0c0"));

        // make sure everything is rendered
        ws.getAllBlocks().forEach(forceRender);

        // final render
        const svg = pxt.blocks.renderWorkspace(options);

        // and we're done
        return {
            ws,
            svg: svg,
            deleted: deletedBlocks.length,
            added: addedBlocks.length,
            modified: 0
        }

        function forceRender(b: Blockly.Block) {
            const a = <any>b;
            a.rendered = false;
            b.inputList.forEach(i => i.fieldRow.forEach(f => {
                delete f.fieldGroup_; // force field rendering
                delete (<any>f).backgroundColour_;
                delete (<any>f).borderColour_;
            }));
        }

        function col(b: Blockly.Block, c: string) {
            vis(b, t => t.setColour(c));
        }

        function done(b: Blockly.Block) {
            vis(b, t => { delete todoBlocks[t.id]; });
        }

        function vis(b: Blockly.Block, f: (b: Blockly.Block) => void) {
            let t = b;
            while (t) {
                f(t);
                t = t.getNextBlock();
            }
        }

        function log(msg: string) {
            console.log(`${msg}:`, Object.keys(todoBlocks))
        }
    }
}