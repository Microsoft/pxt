import * as mem from "./memoryworkspace";

type Header = pxt.workspace.Header;
type ScriptText = pxt.workspace.ScriptText;
type WorkspaceProvider = pxt.workspace.WorkspaceProvider;

let first = true

function loadedAsync(): Promise<void> {
    if (!first)
        return Promise.resolve()
    first = false
    return pxt.editor.postHostMessageAsync(<pxt.editor.EditorWorkspaceSyncRequest>{
        type: "pxthost",
        action: "workspaceloaded",
        response: true
    }).then(() => { })
}

function listAsync() {
    return loadedAsync()
        .then(() => pxt.editor.postHostMessageAsync(<pxt.editor.EditorWorkspaceSyncRequest>{
            type: "pxthost",
            action: "workspacesync",
            response: true
        })).then((msg: pxt.editor.EditorWorkspaceSyncResponse) => {
            (msg.projects || []).forEach(mem.merge);

            // controllerId is a unique identifier of the controller source
            pxt.tickEvent("pxt.controller", { controllerId: msg.controllerId });

            return mem.provider.listAsync()
        })
}

function getAsync(h: Header): Promise<pxt.workspace.File> {
    return mem.provider.getAsync(h)
}

function setAsync(h: Header, prevVer: any, text?: ScriptText) {
    return mem.provider.setAsync(h, prevVer, text)
        .then(() => pxt.editor.postHostMessageAsync(<pxt.editor.EditorWorkspaceSaveRequest>{
            type: "pxthost",
            action: "workspacesave",
            project: { h, text },
            response: false
        })).then(() => { })
}

function resetAsync(): Promise<void> {
    return mem.provider.resetAsync()
        .then(() => pxt.editor.postHostMessageAsync(<pxt.editor.EditorWorkspaceSyncRequest>{
            type: "pxthost",
            action: "workspacereset",
            response: true
        })).then(() => { })
}

export const provider: WorkspaceProvider = {
    getAsync,
    setAsync,
    listAsync,
    resetAsync,
}