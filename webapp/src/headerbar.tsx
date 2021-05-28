/// <reference path="../../built/pxtlib.d.ts" />

import * as React from "react";
import * as data from "./data";
import * as sui from "./sui";

import * as auth from "./auth";
import * as container from "./container";
import * as identity from "./identity";
import * as pkg from "./package";
import * as projects from "./projects";
import * as tutorial from "./tutorial";

type ISettingsProps = pxt.editor.ISettingsProps;
type HeaderBarView = "home" | "editor" | "tutorial" | "debugging" | "sandbox";

interface HeaderBarState {
}

export class HeaderBar extends data.Component<ISettingsProps, HeaderBarState> {
    constructor(props: ISettingsProps) {
        super(props);
    }

    goHome = () => {
        pxt.tickEvent("menu.home", undefined, { interactiveConsent: true });
        this.props.parent.showExitAndSaveDialog();
    }

    showShareDialog = () => {
        pxt.tickEvent("menu.share", undefined, { interactiveConsent: true });
        this.props.parent.showShareDialog();
    }

    launchFullEditor = () => {
        pxt.tickEvent("sandbox.openfulleditor", undefined, { interactiveConsent: true });
        this.props.parent.launchFullEditor();
    }

    exitTutorial = () => {
        const tutorialOptions = this.props.parent.state.tutorialOptions;
        pxt.tickEvent("menu.exitTutorial", { tutorial: tutorialOptions?.tutorial }, { interactiveConsent: true });
        this.props.parent.exitTutorial();
    }

    showReportAbuse = () => {
        pxt.tickEvent("tutorial.reportabuse", undefined, { interactiveConsent: true });
        this.props.parent.showReportAbuse();
    }

    toggleDebug = () => {
        // This function will get called when the user clicks the "Exit Debug Mode" button in the menu bar.
        pxt.tickEvent("simulator.debug", undefined, { interactiveConsent: true });
        this.props.parent.toggleDebugging();
    }

    brandIconClick = () => {
        pxt.tickEvent("projects.brand", undefined, { interactiveConsent: true });
    }

    orgIconClick = () => {
        pxt.tickEvent("projects.org", undefined, { interactiveConsent: true });
    }

    protected getView = (): HeaderBarView => {
        const { home, debugging, tutorialOptions } = this.props.parent.state;
        if (home) {
            return "home";
        } else if (pxt.shell.isSandboxMode()) {
            return "sandbox";
        } else if (debugging) {
            return "debugging";
        } else if (!!tutorialOptions?.tutorial) {
            return "tutorial";
        } else {
            return "editor";
        }
    }

    getOrganizationLogo(targetTheme: pxt.AppTheme, highContrast?: boolean) {
        return <a href={targetTheme.organizationUrl} target="blank" rel="noopener" className="ui item logo organization" onClick={this.orgIconClick}>
            {targetTheme.organizationWideLogo || targetTheme.organizationLogo
                ? <img className="ui logo" src={targetTheme.organizationWideLogo || targetTheme.organizationLogo} alt={lf("{0} Logo", targetTheme.organization)} />
                : <span className="name">{targetTheme.organization}</span>}
        </a>
    }

    getTargetLogo(targetTheme: pxt.AppTheme, highContrast?: boolean) {
        return <a href={targetTheme.logoUrl} aria-label={lf("{0} Logo", targetTheme.boardName)} role="menuitem" target="blank" rel="noopener" className="ui item logo brand portrait hide" onClick={this.brandIconClick}>
            {targetTheme.useTextLogo
            ? <span className="name">{targetTheme.textLogo}</span>
            : (targetTheme.logo || targetTheme.portraitLogo
                ? <img className={`ui ${targetTheme.logoWide ? "small" : ""} logo`} src={targetTheme.logo || targetTheme.portraitLogo} alt={lf("{0} Logo", targetTheme.boardName)} />
                : <span className="name">{targetTheme.boardName}</span>)}
        </a>
    }

    getCenterLabel(targetTheme: pxt.AppTheme, view: HeaderBarView, tutorialOptions?: pxt.tutorial.TutorialOptions) {
        const showAssets = !!pkg.mainEditorPkg().files[pxt.ASSETS_FILE];
        const languageRestriction = pkg.mainPkg?.config?.languageRestriction;
        // If there is only one editor (eg Py only, no assets), we display a label instead of a toggle
        const hideToggle = !showAssets && (languageRestriction === pxt.editor.LanguageRestriction.JavaScriptOnly
            || languageRestriction === pxt.editor.LanguageRestriction.PythonOnly) || targetTheme.blocksOnly;

        switch (view) {
            case "tutorial":
                const activityName = tutorialOptions?.tutorialActivityInfo ?
                    tutorialOptions.tutorialActivityInfo[tutorialOptions.tutorialStepInfo[tutorialOptions.tutorialStep].activity].name :
                    null;
                const hideIteration = tutorialOptions?.metadata?.hideIteration;

                if (activityName) return <div className="ui item">{activityName}</div>
                if (!hideIteration) return <tutorial.TutorialMenu parent={this.props.parent} />
                break;
            case "debugging":
                return  <sui.MenuItem className="debugger-menu-item centered" icon="large bug" name="Debug Mode" />
            case "sandbox":
            case "editor":
                if (hideToggle) {
                    // Label for single language
                    switch (languageRestriction) {
                        case pxt.editor.LanguageRestriction.PythonOnly:
                            return <sui.MenuItem className="centered" icon="xicon python" name="Python" />
                        case pxt.editor.LanguageRestriction.JavaScriptOnly:
                            return <sui.MenuItem className="centered" icon="xicon js" name="JavaScript" />
                        default:
                            break;
                    }
                } else {
                    return <div className="ui item link editor-menuitem">
                        <container.EditorSelector parent={this.props.parent} sandbox={view === "sandbox"} python={targetTheme.python} languageRestriction={languageRestriction} headless={pxt.appTarget.simulator?.headless} />
                    </div>
                }
        }

        return <div />;
    }

    getExitButtons(targetTheme: pxt.AppTheme, view: HeaderBarView, tutorialOptions?: pxt.tutorial.TutorialOptions) {
        switch (view) {
            case "debugging":
                return <sui.ButtonMenuItem className="exit-debugmode-btn" role="menuitem" icon="external" text={lf("Exit Debug Mode")} textClass="landscape only" onClick={this.toggleDebug} />
            case "sandbox":
                if (!targetTheme.hideEmbedEdit) return <sui.Item role="menuitem" icon="external" textClass="mobile hide" text={lf("Edit")} onClick={this.launchFullEditor} />
            case "tutorial":
                const tutorialButtons = [];
                if (tutorialOptions?.tutorialReportId) {
                    tutorialButtons.push(<sui.ButtonMenuItem key="tutorial-report" className="report-tutorial-btn" role="menuitem" icon="warning circle" text={lf("Report Abuse")} textClass="landscape only" onClick={this.showReportAbuse} />)
                }
                if (!targetTheme.lockedEditor && !tutorialOptions?.metadata?.hideIteration) {
                    tutorialButtons.push(<sui.ButtonMenuItem key="tutorial-exit" className="exit-tutorial-btn" role="menuitem" icon="sign out" text={lf("Exit tutorial")} textClass="landscape only" onClick={this.exitTutorial} />)
                }

                if (!!tutorialButtons.length) return tutorialButtons;
        }

        return <div />
    }

    // TODO: eventually unify these components into one menu
    getSettingsMenu(view: HeaderBarView) {
        const { greenScreen, accessibleBlocks } = this.props.parent.state;
        switch (view){
            case "home":
                return <projects.ProjectSettingsMenu parent={this.props.parent} />
            case "editor":
                return  <container.SettingsMenu parent={this.props.parent} greenScreen={greenScreen} accessibleBlocks={accessibleBlocks} />
            default:
                return <div />
        }
    }

    renderCore() {
        const targetTheme = pxt.appTarget.appTheme;
        const highContrast = this.getData<boolean>(auth.HIGHCONTRAST);
        const view = this.getView();

        const { home, header, tutorialOptions } = this.props.parent.state;
        const isController = pxt.shell.isControllerMode();
        const activeEditor = this.props.parent.isPythonActive() ? "Python"
            : (this.props.parent.isJavaScriptActive() ? "JavaScript" : "Blocks");

        const showHomeButton = view !== "home" && view !== "tutorial" && !targetTheme.lockedEditor && !isController;
        const showShareButton = view !== "tutorial" && view !== "debugging" && header && pxt.appTarget.cloud?.sharing && !isController;
        const showHelpButton = view === "editor" && targetTheme.docMenu?.length;

        // Approximate each tutorial step to be 22 px
        const manyTutorialSteps = view == "tutorial" && (tutorialOptions.tutorialStepInfo.length * 22 > window.innerWidth / 3);

        // TODO clean up homemenu css entirely?
        return <div id="mainmenu" className={`ui borderless fixed menu ${targetTheme.invertedMenu ? `inverted` : ''} ${manyTutorialSteps ? "thin" : ""}`} role="menubar">
            <div className="left menu">
                {this.getOrganizationLogo(targetTheme, highContrast)}
                {view === "tutorial"
                    // TODO: temporary place for tutorial name, we will eventually redesign the header for tutorial view
                    ? <sui.Item className="tutorialname" tabIndex={-1} textClass="landscape only" text={tutorialOptions.tutorialName}/>
                    : this.getTargetLogo(targetTheme, highContrast)}
            </div>
            {!home && <div className="center menu">
                {this.getCenterLabel(targetTheme, view, tutorialOptions)}
            </div>}
            <div className="right menu">
                {this.getExitButtons(targetTheme, view, tutorialOptions)}
                {showHomeButton && <sui.Item className="icon openproject" role="menuitem" textClass="landscape only" icon="home large" ariaLabel={lf("Home screen")} onClick={this.goHome} />}
                {showShareButton && <sui.Item className="icon shareproject" role="menuitem" textClass="widedesktop only" ariaLabel={lf("Share Project")} icon="share alternate large" onClick={this.showShareDialog} />}
                {showHelpButton && <container.DocsMenu parent={this.props.parent} editor={activeEditor} />}
                {this.getSettingsMenu(view)}
                {auth.hasIdentity() && (view === "home" || view === "editor") && <identity.UserMenu parent={this.props.parent} />}
            </div>
        </div>
    }
}