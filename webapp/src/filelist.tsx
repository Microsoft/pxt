/// <reference path="../../typings/globals/react/index.d.ts" />
/// <reference path="../../typings/globals/react-dom/index.d.ts" />
/// <reference path="../../built/pxtlib.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as workspace from "./workspace";
import * as data from "./data";
import * as sui from "./sui";
import * as pkg from "./package";
import * as core from "./core";

type ISettingsProps = pxt.editor.ISettingsProps;

interface FileListState {
    expands: pxt.Map<boolean>;
}

export class FileList extends data.Component<ISettingsProps, FileListState> {

    constructor(props: ISettingsProps) {
        super(props);
        this.state = {
            expands: {}
        }
    }

    private removePkg(e: React.MouseEvent, p: pkg.EditorPackage) {
        e.stopPropagation();
        core.confirmAsync({
            header: lf("Remove {0} package", p.getPkgId()),
            body: lf("You are about to remove a package from your project. Are you sure?"),
            agreeClass: "red",
            agreeIcon: "trash",
            agreeLbl: lf("Remove it"),
        }).done(res => {
            if (res) {
                pkg.mainEditorPkg().removeDepAsync(p.getPkgId())
                    .then(() => this.props.parent.reloadHeaderAsync())
                    .done()
            }
        })
    }

    private removeFile(e: React.MouseEvent, f: pkg.File) {
        e.stopPropagation();
        this.props.parent.removeFile(f);
    }

    private updatePkg(e: React.MouseEvent, p: pkg.EditorPackage) {
        e.stopPropagation();
        pkg.mainEditorPkg().updateDepAsync(p.getPkgId())
            .then(() => this.props.parent.reloadHeaderAsync())
            .done()
    }

    private filesOf(pkg: pkg.EditorPackage): JSX.Element[] {
        const deleteFiles = pkg.getPkgId() == "this";
        const parent = this.props.parent;
        return pkg.sortedFiles().map(file => {
            let meta: pkg.FileMeta = this.getData("open-meta:" + file.getName())
            return (
                <a key={file.getName() }
                    onClick={() => parent.setSideFile(file) }
                    className={(parent.state.currFile == file ? "active " : "") + (pkg.isTopLevel() ? "" : "nested ") + "item"}
                    >
                    {file.name} {meta.isSaved ? "" : "*"}
                    {/\.ts$/.test(file.name) ? <i className="align left icon"></i> : /\.blocks$/.test(file.name) ? <i className="puzzle icon"></i> : undefined }
                    {meta.isReadonly ? <i className="lock icon"></i> : null}
                    {!meta.numErrors ? null : <span className='ui label red'>{meta.numErrors}</span>}
                    {deleteFiles && /\.blocks$/i.test(file.getName()) ? <sui.Button class="primary label" icon="trash" onClick={(e) => this.removeFile(e, file) } /> : ''}
                </a>);
        })
    }

    private packageOf(p: pkg.EditorPackage) {
        const expands = this.state.expands;
        let del = p.getPkgId() != pxt.appTarget.id && p.getPkgId() != "built";
        let upd = p.getKsPkg() && p.getKsPkg().verProtocol() == "github";
        return [<div key={"hd-" + p.getPkgId() } className="header link item" onClick={() => this.togglePkg(p) }>
            <i className={`chevron ${expands[p.getPkgId()] ? "down" : "right"} icon`}></i>
            {upd ? <sui.Button class="primary label" icon="refresh" onClick={(e) => this.updatePkg(e, p) } /> : ''}
            {del ? <sui.Button class="primary label" icon="trash" onClick={(e) => this.removePkg(e, p) } /> : ''}
            {p.getPkgId() }
        </div>
        ].concat(expands[p.getPkgId()] ? this.filesOf(p) : [])
    }

    private togglePkg(p: pkg.EditorPackage) {
        const expands = this.state.expands;
        expands[p.getPkgId()] = !expands[p.getPkgId()];
        this.forceUpdate();
    }

    private filesWithHeader(p: pkg.EditorPackage) {
        return p.isTopLevel() ? this.filesOf(p) : this.packageOf(p);
    }

    private toggleVisibility() {
        this.props.parent.setState({ showFiles: !this.props.parent.state.showFiles });
    }

    private addFile() {
        const f = "custom.ts";
        const p = pkg.mainEditorPkg();
        if (p.files[f]) // already in there
            return Promise.resolve();

        p.setFile(f, `
/**
 * ${lf("Custom blocks")}
 */
//% weight=100 color=#f00000
namespace custom {
    /**
     * TODO: ${lf("describe your function here")}
     * @param value ${lf("describe value here")}
     */    
    //% block
    export function foo(value: number) {
        // TODO: ${lf("add code here")} 
    }
}
`);
        return p.updateConfigAsync(cfg => {
            if (cfg.files.indexOf(f) < 0) cfg.files.push(f);
        }).then(() => p.savePkgAsync())
          .then(() => this.props.parent.reloadHeaderAsync());
    }

    renderCore() {
        const show = !!this.props.parent.state.showFiles;
        const targetTheme = pxt.appTarget.appTheme;
        return <div className={`ui tiny vertical ${targetTheme.invertedMenu ? `inverted` : ''} menu filemenu landscape only`}>
            <div key="projectheader" className="link item" onClick={() => this.toggleVisibility() }>
                {lf("Explorer") }
                <i className={`chevron ${show ? "down" : "right"} icon`}></i>
                <sui.Button class="primary label" icon="newfile" onClick={(e) => this.addFile() } />
            </div>
            {show ? Util.concat(pkg.allEditorPkgs().map(p => this.filesWithHeader(p))) : undefined }
        </div>;
    }
}