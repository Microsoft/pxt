/// <reference path="../../built/pxtlib.d.ts"/>
import * as core from "./core";
import * as electron from "./electron";
import * as pkg from "./package";
import * as hidbridge from "./hidbridge";
import * as webusb from "./webusb";
import * as data from "./data";
import * as dialogs from "./dialogs";
import Cloud = pxt.Cloud;
import { isDontShowDownloadDialogFlagSet } from "./dialogs";

function log(msg: string) {
    pxt.debug(`cmds: ${msg}`);
}

let extensionResult: pxt.editor.ExtensionResult;
// This can be overidden by the extension result
pxt.commands.renderBrowserDownloadInstructions = dialogs.renderBrowserDownloadInstructions;
pxt.commands.renderIncompatibleHardwareDialog = dialogs.renderIncompatibleHardwareDialog;


function browserDownloadAsync(text: string, name: string, contentType: string): Promise<void> {
    pxt.BrowserUtils.browserDownloadBinText(
        text,
        name,
        {
            contentType: contentType,
            onError: (e: any) => core.errorNotification(lf("saving file failed..."))
        }
    );

    return Promise.resolve();
}

export function browserDownloadDeployCoreAsync(resp: pxtc.CompileResult): Promise<void> {
    let url = ""
    const ext = pxt.outputName().replace(/[^.]*/, "")
    const out = resp.outfiles[pxt.outputName()]
    const fn = pkg.genFileName(ext);
    const userContext = pxt.BrowserUtils.isBrowserDownloadWithinUserContext();
    if (userContext) {
        url = pxt.BrowserUtils.toDownloadDataUri(pxt.isOutputText() ? ts.pxtc.encodeBase64(out) : out, pxt.appTarget.compile.hexMimeType);
    } else if (!pxt.isOutputText()) {
        log('saving ' + fn)
        url = pxt.BrowserUtils.browserDownloadBase64(
            out,
            fn,
            {
                contentType: "application/x-uf2",
                userContextWindow: resp.userContextWindow,
                onError: e => core.errorNotification(lf("saving file failed...")),
                maintainObjectURL: true,
            }
        );
    } else {
        log('saving ' + fn)
        url = pxt.BrowserUtils.browserDownloadBinText(
            out,
            fn,
            {
                contentType: pxt.appTarget.compile.hexMimeType,
                userContextWindow: resp.userContextWindow,
                onError: e => core.errorNotification(lf("saving file failed...")),
                maintainObjectURL: true,
            }
        );
    }

    if (!resp.success) {
        return Promise.resolve();
    }

    if (!userContext && pxt.BrowserUtils.isBrowserDownloadInSameWindow() || (!resp.saveOnly && isDontShowDownloadDialogFlagSet())) {
        return Promise.resolve()
            .then(() => window.URL?.revokeObjectURL(url));
    }
    else {
        // save does the same as download as far iOS is concerned
        return pxt.commands.showUploadInstructionsAsync(fn, url, core.confirmAsync, resp.saveOnly)
            .then(() => window.URL?.revokeObjectURL(url));
    }
}

function showUploadInstructionsAsync(fn: string, url: string, confirmAsync: (options: core.PromptOptions) => Promise<number>, saveonly?: boolean): Promise<void> {
    const boardName = pxt.appTarget.appTheme.boardName || lf("device");
    const boardDriveName = pxt.appTarget.appTheme.driveDisplayName || pxt.appTarget.compile.driveName || "???";

    // https://msdn.microsoft.com/en-us/library/cc848897.aspx
    // "For security reasons, data URIs are restricted to downloaded resources.
    // Data URIs cannot be used for navigation, for scripting, or to populate frame or iframe elements"
    const userDownload = pxt.BrowserUtils.isBrowserDownloadWithinUserContext();
    const downloadAgain = !pxt.BrowserUtils.isIE() && !pxt.BrowserUtils.isEdge();
    const helpUrl = pxt.appTarget.appTheme.usbDocs;
    const saveAs = pxt.BrowserUtils.hasSaveAs();
    const ext = pxt.appTarget.compile.useUF2 ? ".uf2" : ".hex";
    const connect = pxt.usb.isEnabled && pxt.appTarget?.compile?.webUSB;
    const jsx = !userDownload && !saveAs && pxt.commands.renderBrowserDownloadInstructions && pxt.commands.renderBrowserDownloadInstructions(saveonly);
    const body = userDownload ? lf("Click 'Download' to open the {0} app.", pxt.appTarget.appTheme.boardName) :
        saveAs ? lf("Click 'Save As' and save the {0} file to the {1} drive to transfer the code into your {2}.",
            ext,
            boardDriveName, boardName)
            : !jsx && lf("Move the {0} file to the {1} drive to transfer the code into your {2}.",
                ext,
                boardDriveName, boardName);
    const timeout = pxt.BrowserUtils.isBrowserDownloadWithinUserContext() ? 0 : 10000;
    return confirmAsync({
        header: userDownload ? lf("Download ready...") : lf("Download completed..."),
        body,
        jsx,
        hasCloseIcon: true,
        hideAgree: true,
        helpUrl,
        bigHelpButton: true,
        className: 'downloaddialog',
        buttons: [
            downloadAgain && {
                label: userDownload ? lf("Download") : lf("Download again"),
                className: userDownload ? "primary" : "lightgrey",
                urlButton: true,
                url,
                fileName: fn
            },
            {
                label: lf("Done"),
                className: "primary",
                onclick: () => {
                    pxt.tickEvent('downloaddialog.done')
                    core.hideDialog();
                }
            },
        ],
        timeout
    }).then(() => { });
}

export function nativeHostPostMessageFunction(): (msg: pxt.editor.NativeHostMessage) => void {
    const webkit = (<any>window).webkit;
    if (webkit
        && webkit.messageHandlers
        && webkit.messageHandlers.host
        && webkit.messageHandlers.host.postMessage)
        return msg => webkit.messageHandlers.host.postMessage(msg);
    const android = (<any>window).android;
    if (android && android.postMessage)
        return msg => android.postMessage(JSON.stringify(msg));
    return undefined;
}

export function isNativeHost(): boolean {
    return !!nativeHostPostMessageFunction();
}

function nativeHostDeployCoreAsync(resp: pxtc.CompileResult): Promise<void> {
    log(`native deploy`)
    core.infoNotification(lf("Flashing device..."));
    const out = resp.outfiles[pxt.outputName()];
    const nativePostMessage = nativeHostPostMessageFunction();
    nativePostMessage(<pxt.editor.NativeHostMessage>{
        name: resp.downloadFileBaseName,
        download: out
    })
    return Promise.resolve();
}

function nativeHostSaveCoreAsync(resp: pxtc.CompileResult): Promise<void> {
    log(`native save`)
    core.infoNotification(lf("Saving file..."));
    const out = resp.outfiles[pxt.outputName()]
    const nativePostMessage = nativeHostPostMessageFunction();
    nativePostMessage(<pxt.editor.NativeHostMessage>{
        name: resp.downloadFileBaseName,
        save: out
    })
    return Promise.resolve();
}

export function nativeHostBackAsync(): Promise<void> {
    log(`native back`)
    const nativePostMessage = nativeHostPostMessageFunction();
    if (nativePostMessage) {
        nativePostMessage(<pxt.editor.NativeHostMessage>{
            cmd: "backtap"
        })
    }
    return Promise.resolve();
}

export function nativeHostLongpressAsync(): Promise<void> {
    log(`native longpress`)
    const nativePostMessage = nativeHostPostMessageFunction();
    if (nativePostMessage) {
        nativePostMessage(<pxt.editor.NativeHostMessage>{
            cmd: "backpress"
        })
    }
    return Promise.resolve();
}

export function hidDeployCoreAsync(resp: pxtc.CompileResult, d?: pxt.commands.DeployOptions): Promise<void> {
    pxt.tickEvent(`hid.deploy`);
    log(`hid deploy`)
    // error message handled in browser download
    if (!resp.success) {
        log(`compilation failed, use browser deploy instead`)
        return browserDownloadDeployCoreAsync(resp);
    }
    const LOADING_KEY = "hiddeploy";
    deployingPacketIO = true
    return deployAsync()
        .finally(() => {
            deployingPacketIO = false
        })

    function deployAsync(): Promise<void> {
        // packetio should time out first
        return pxt.Util.promiseTimeout(120000,
            pxt.packetio.initAsync(false)
                .then(dev => core.showLoadingAsync(LOADING_KEY, lf("Downloading..."),
                    dev.reflashAsync(resp)
                        .then(() => dev.reconnectAsync()), 5000))
                .finally(() => core.hideLoading(LOADING_KEY))
        ).catch((e) => {
            if (e.type === "repairbootloader") {
                return pairBootloaderAsync()
                    .then(() => hidDeployCoreAsync(resp))
            } else if (e.message === "timeout") {
                pxt.tickEvent("hid.flash.timeout");
                log(`flash timeout`);
            } else if (e.type === "devicenotfound") {
                pxt.tickEvent("hid.flash.devicenotfound");
                // no device, just save
                log(`device not found`);
                return pxt.commands.saveOnlyAsync(resp);
            } else if (e.code == 19 || e.type === "devicelocked") {
                // device is locked or used by another tab
                pxt.tickEvent("hid.flash.devicelocked");
                log(`error: device locked`);
                return pxt.commands.saveOnlyAsync(resp);
            } else {
                pxt.tickEvent("hid.flash.error");
                log(`hid error ${e.message}`)
                pxt.reportException(e)
                if (d) d.reportError(e.message);
            }

            // default, save file
            return pxt.commands.saveOnlyAsync(resp);
        })
    }
}

function pairBootloaderAsync(): Promise<void> {
    log(`pair bootloader`)
    return pairAsync();
}

function winrtDeployCoreAsync(r: pxtc.CompileResult, d: pxt.commands.DeployOptions): Promise<void> {
    log(`winrt deploy`)
    return pxt.Util.promiseTimeout(180000, hidDeployCoreAsync(r, d))
        .catch((e) => {
            return pxt.packetio.disconnectAsync()
                .catch((e) => {
                    // Best effort disconnect; at this point we don't even know the state of the device
                    pxt.reportException(e);
                })
                .then(() => {
                    return core.confirmAsync({
                        header: lf("Something went wrong..."),
                        body: lf("Flashing your {0} took too long. Please disconnect your {0} from your computer and try reconnecting it.", pxt.appTarget.appTheme.boardName || lf("device")),
                        disagreeLbl: lf("Ok"),
                        hideAgree: true
                    });
                })
                .then(() => {
                    return pxt.commands.saveOnlyAsync(r);
                });
        });
}

function localhostDeployCoreAsync(resp: pxtc.CompileResult): Promise<void> {
    log('local deploy');
    core.infoNotification(lf("Uploading..."));
    let deploy = () => pxt.Util.requestAsync({
        url: "/api/deploy",
        headers: { "Authorization": Cloud.localToken },
        method: "POST",
        data: resp,
        allowHttpErrors: true // To prevent "Network request failed" warning in case of error. We're not actually doing network requests in localhost scenarios
    }).then(r => {
        if (r.statusCode !== 200) {
            core.errorNotification(lf("There was a problem, please try again"));
        } else if (r.json["boardCount"] === 0) {
            core.warningNotification(lf("Please connect your {0} to your computer and try again", pxt.appTarget.appTheme.boardName));
        }
    });

    return deploy()
}

function winrtSaveAsync(resp: pxtc.CompileResult) {
    return pxt.winrt.saveOnlyAsync(resp)
        .then((saved) => {
            if (saved) {
                core.infoNotification(lf("file saved!"));
            }
        })
        .catch((e) => core.errorNotification(lf("saving file failed...")));
}

export function setExtensionResult(res: pxt.editor.ExtensionResult) {
    extensionResult = res;
    applyExtensionResult();
}

function applyExtensionResult() {
    const res = extensionResult;
    if (!res) return;

    if (res.mkPacketIOWrapper) {
        log(`extension mkPacketIOWrapper`)
        pxt.packetio.mkPacketIOWrapper = res.mkPacketIOWrapper;
    }
    if (res.deployAsync) {
        log(`extension deploy core async`);
        pxt.commands.deployCoreAsync = res.deployAsync;
    }
    if (res.saveOnlyAsync) {
        log(`extension save only async`);
        pxt.commands.saveOnlyAsync = res.saveOnlyAsync;
    }
    if (res.saveProjectAsync) {
        log(`extension save project async`);
        pxt.commands.saveProjectAsync = res.saveProjectAsync;
    }
    if (res.renderBrowserDownloadInstructions) {
        log(`extension upload renderBrowserDownloadInstructions`);
        pxt.commands.renderBrowserDownloadInstructions = res.renderBrowserDownloadInstructions;
    }
    if (res.renderUsbPairDialog) {
        log(`extension renderUsbPairDialog`)
        pxt.commands.renderUsbPairDialog = res.renderUsbPairDialog;
    }
    if (res.renderIncompatibleHardwareDialog) {
        log(`extension renderIncompatibleHardwareDialog`)
        pxt.commands.renderIncompatibleHardwareDialog = res.renderIncompatibleHardwareDialog;
    }
    if (res.showUploadInstructionsAsync) {
        log(`extension upload instructions async`);
        pxt.commands.showUploadInstructionsAsync = res.showUploadInstructionsAsync;
    }
    if (res.patchCompileResultAsync) {
        log(`extension build patch`);
        pxt.commands.patchCompileResultAsync = res.patchCompileResultAsync;
    }
    if (res.blocklyPatch) {
        log(`extension blockly patch`);
        pxt.blocks.extensionBlocklyPatch = res.blocklyPatch;
    }
    if (res.webUsbPairDialogAsync) {
        log(`extension webusb pair dialog`);
        pxt.commands.webUsbPairDialogAsync = res.webUsbPairDialogAsync;
    }
    if (res.onTutorialCompleted) {
        log(`extension tutorial completed`);
        pxt.commands.onTutorialCompleted = res.onTutorialCompleted;
    }
}

export async function initAsync() {
    log(`cmds init`);
    pxt.onAppTargetChanged = () => {
        log('app target changed')
        initAsync()
    }

    // check webusb
    await pxt.usb.checkAvailableAsync()

    // unplug any existing packetio
    await pxt.packetio.disconnectAsync()

    // reset commands to browser
    pxt.packetio.mkPacketIOWrapper = undefined;
    pxt.commands.renderDisconnectDialog = undefined;
    pxt.commands.deployCoreAsync = browserDownloadDeployCoreAsync;
    pxt.commands.browserDownloadAsync = browserDownloadAsync;
    pxt.commands.saveOnlyAsync = browserDownloadDeployCoreAsync;
    pxt.commands.webUsbPairDialogAsync = webusb.webUsbPairDialogAsync;
    pxt.commands.showUploadInstructionsAsync = showUploadInstructionsAsync;
    pxt.packetio.mkPacketIOAsync = undefined;

    // uf2/hf2 support
    if (pxt.appTarget?.compile?.useUF2) {
        log(`hf2 wrapper`)
        pxt.packetio.mkPacketIOWrapper = pxt.HF2.mkHF2PacketIOWrapper;
    }

    // check if webUSB is available and usable
    if ((pxt.appTarget?.compile?.isNative || pxt.appTarget?.compile?.hasHex) && !pxt.BrowserUtils.isPxtElectron()) {
        // TODO: web USB is currently disabled in electron app, but should be supported.
        if (pxt.usb.isAvailable() && pxt.appTarget?.compile?.webUSB) {
            log(`enabled webusb`);
            pxt.usb.setEnabled(true);
            pxt.packetio.mkPacketIOAsync = pxt.usb.mkWebUSBHIDPacketIOAsync;
        } else {
            log(`enabled hid bridge (webusb disabled)`);
            pxt.usb.setEnabled(false);
            pxt.packetio.mkPacketIOAsync = hidbridge.mkHIDBridgePacketIOAsync;
        }
    }

    const forceBrowserDownload = /force(Hex)?(Browser)?Download/i.test(window.location.href);
    const webUSBSupported = pxt.usb.isEnabled && pxt.appTarget?.compile?.webUSB;
    if (forceBrowserDownload || pxt.appTarget?.serial?.noDeploy) {
        log(`deploy: force browser download`);
        // commands are ready
    } else if (isNativeHost()) {
        log(`deploy: webkit deploy/save`);
        pxt.commands.deployCoreAsync = nativeHostDeployCoreAsync;
        pxt.commands.saveOnlyAsync = nativeHostSaveCoreAsync;
    } else if (pxt.winrt.isWinRT()) { // windows app
        log(`deploy: winrt`)
        pxt.packetio.mkPacketIOAsync = pxt.winrt.mkWinRTPacketIOAsync;
        pxt.commands.browserDownloadAsync = pxt.winrt.browserDownloadAsync;
        pxt.commands.deployCoreAsync = winrtDeployCoreAsync;
        pxt.commands.saveOnlyAsync = winrtSaveAsync;
    } else if (pxt.BrowserUtils.isPxtElectron()) {
        log(`deploy: electron`);
        pxt.commands.deployCoreAsync = electron.driveDeployAsync;
        pxt.commands.electronDeployAsync = electron.driveDeployAsync;
    } else if (webUSBSupported) {
        log(`deploy: webusb`);
        pxt.commands.deployCoreAsync = hidDeployCoreAsync;
        pxt.commands.renderDisconnectDialog = webusb.renderUnpairDialog;
    } else if (hidbridge.shouldUse()) {
        log(`deploy: hid`);
        pxt.commands.deployCoreAsync = hidDeployCoreAsync;
    } else if (pxt.BrowserUtils.isLocalHost() && Cloud.localToken) { // local node.js
        log(`deploy: localhost`);
        pxt.commands.deployCoreAsync = localhostDeployCoreAsync;
    } else { // in browser
        log(`deploy: browser only`);
        // commands are ready
    }

    applyExtensionResult();

    // don't initialize until extension has hookup as well
    if (pxt.winrt.isWinRT()) {
        log(`deploy: init winrt`)
        pxt.winrt.initWinrtHid(
            () => pxt.packetio.initAsync(true).then(wrap => wrap?.reconnectAsync()),
            () => pxt.packetio.disconnectAsync()
        );
    }
}

export function maybeReconnectAsync(pairIfDeviceNotFound = false, skipIfConnected = false) {
    log("[CLIENT]: starting reconnect")

    if (skipIfConnected && pxt.packetio.isConnected() && !disconnectingPacketIO) return Promise.resolve();

    if (reconnectPromise) return reconnectPromise;
    reconnectPromise = requestPacketIOLockAsync()
        .then(() => pxt.packetio.initAsync())
        .then(wrapper => {
            if (!wrapper) return Promise.resolve();
            return wrapper.reconnectAsync()
                .catch(e => {
                    if (e.type == "devicenotfound")
                        return pairIfDeviceNotFound && pairAsync();
                    throw e;
                })
        })
        .finally(() => {
            reconnectPromise = undefined;
        })
    return reconnectPromise;
}

export function pairAsync(): Promise<void> {
    pxt.tickEvent("cmds.pair")
    return pxt.commands.webUsbPairDialogAsync(pxt.usb.pairAsync, core.confirmAsync)
        .then(res => {
            if (res) return maybeReconnectAsync();
            else return core.infoNotification("Oops, no device was paired.")
        });
}

export function showDisconnectAsync(): Promise<void> {
    if (pxt.commands.renderDisconnectDialog) {
        const { header, jsx, helpUrl } = pxt.commands.renderDisconnectDialog();
        return core.dialogAsync({ header, jsx, helpUrl, hasCloseIcon: true });
    }
    return Promise.resolve();
}

export function disconnectAsync(): Promise<void> {
    log("[CLIENT]: starting disconnect")
    disconnectingPacketIO = true;
    return pxt.packetio.disconnectAsync()
        .then(() => {
            log("[CLIENT]: sending confirmed disconnect " + lockRef)
            hasLock = false;
            sendServiceWorkerMessage({
                type: "serviceworkerclient",
                action: "release-packet-io-lock",
                lock: lockRef
            });
            disconnectingPacketIO = false;
        })
}


// Generate a unique id for communicating with the service worker
const lockRef = pxtc.Util.guidGen();
let pendingPacketIOLockResolver: () => void;
let pendingPacketIOLockRejecter: () => void;
let serviceWorkerSupportedResolver: () => void;
let reconnectPromise: Promise<void>;
let hasLock = false;
let deployingPacketIO = false;
let disconnectingPacketIO = false;
let serviceWorkerSupported: boolean | undefined = undefined;

async function requestPacketIOLockAsync() {
    if (hasLock) return;
    if (pendingPacketIOLockResolver) return Promise.reject("Already waiting for packet lock");
    const supported = await checkIfServiceWorkerSupportedAsync();
    if (!supported) return;

    if (navigator?.serviceWorker?.controller) {
        return new Promise<void>((resolve, reject) => {
            pendingPacketIOLockResolver = resolve;
            pendingPacketIOLockRejecter = reject;
            log("[CLIENT]: requesting lock " + lockRef)
            sendServiceWorkerMessage({
                type: "serviceworkerclient",
                action: "request-packet-io-lock",
                lock: lockRef
            });
        })
            .finally(() => {
                pendingPacketIOLockResolver = undefined;
                pendingPacketIOLockRejecter = undefined;
            })
    }
}

function sendServiceWorkerMessage(message: pxt.ServiceWorkerClientMessage) {
    if (navigator?.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage(message);
    }
}

export async function handleServiceWorkerMessageAsync(message: pxt.ServiceWorkerMessage) {
    if (message.action === "packet-io-lock-disconnect" && !pendingPacketIOLockResolver && lockRef === message.lock) {
        log("[CLIENT]: received disconnect request " + lockRef)

        if (deployingPacketIO || pxt.packetio.isConnecting()) {
            sendServiceWorkerMessage({
                type: "serviceworkerclient",
                action: "packet-io-lock-disconnect",
                lock: lockRef,
                didDisconnect: false
            });
        }
        else {
            await disconnectAsync();
        }
    }
    else if (message.action === "packet-io-lock-granted" && message.lock === lockRef && pendingPacketIOLockResolver) {
        if (message.granted) {
            log("[CLIENT]: received granted lock " + lockRef)
            pendingPacketIOLockResolver();
            hasLock = true;
        }
        else {
            log("[CLIENT]: received denied lock " + lockRef)
            pendingPacketIOLockRejecter();
        }
        pendingPacketIOLockResolver = undefined;
        pendingPacketIOLockRejecter = undefined;
    }
    else if (message.action === "packet-io-supported" && serviceWorkerSupportedResolver) {
        serviceWorkerSupportedResolver();
        serviceWorkerSupported = true;
        serviceWorkerSupportedResolver = undefined;
    }
    else if (message.action === "packet-io-status") {
        sendServiceWorkerMessage({
            type: "serviceworkerclient",
            action: "packet-io-status",
            hasLock: hasLock,
            lock: lockRef
        });
    }
}

/**
 * This code checks to see if the service worker supports the webusb locking code.
 * It's possible to get into a state where you have an old service worker if you are
 * switching between app versions and the webapp hasn't refreshed yet for whatever
 * reason.
 */
async function checkIfServiceWorkerSupportedAsync() {
    if (serviceWorkerSupported !== undefined) return serviceWorkerSupported;

    const p = new Promise<void>(resolve => {
        // This is resolved in handleServiceWorkerMessageAsync when the
        // service worker sends back the appropriate response
        serviceWorkerSupportedResolver = resolve;
        sendServiceWorkerMessage({
            type: "serviceworkerclient",
            action: "packet-io-supported"
        });
    });

    try {
        // If we don't get a response within 1 second, this will throw
        // and we can assume that we have an old service worker
        await pxt.U.promiseTimeout(1000, p);
        serviceWorkerSupported = true;
    }
    catch (e) {
        log("[CLIENT]: old version of service worker, ignoring lock")
        serviceWorkerSupported = false;
    }

    return serviceWorkerSupported;
}

function handlePacketIOApi(r: string) {
    const p = data.stripProtocol(r);
    switch (p) {
        case "active":
            return pxt.packetio.isActive();
        case "connected":
            return pxt.packetio.isConnected();
        case "connecting":
            return pxt.packetio.isConnecting();
        case "icon":
            return pxt.packetio.icon();
    }
    return false;
}

export function showUnsupportedHardwareMessageAsync(resp: pxtc.CompileResult) {
    if (!pxt.packetio.isConnected()) return true;

    const unsupportedParts = pxt.packetio.unsupportedParts();
    const parts = pxtc.computeUsedParts(resp);

    let unsupported: string[] = [];;
    for (const part of unsupportedParts) {
        if (parts.indexOf(part) !== -1) {
            unsupported.push(part);
            break;
        }
    }

    if (unsupported.length) {
        const jsx = pxt.commands.renderIncompatibleHardwareDialog(unsupported);
        pxt.tickEvent('unsupportedhardwaredialog.shown')

        const helpUrl = pxt.appTarget.appTheme.downloadDialogTheme?.incompatibleHardwareHelpURL;
        let cancelled = true;
        return core.confirmAsync({
            header: lf("Incompatible Code"),
            jsx,
            hasCloseIcon: true,
            hideAgree: true,
            helpUrl,
            bigHelpButton: true,
            className: 'downloaddialog',
            buttons: [
                {
                    label: lf("Download Anyway"),
                    className: "primary",
                    onclick: () => {
                        pxt.tickEvent('unsupportedhardwaredialog.downloadagain')
                        cancelled = false;
                        core.hideDialog();
                    }
                },
            ]
        }).then(() => {
            if (cancelled) {
                pxt.tickEvent('unsupportedhardwaredialog.cancelled')
            }

            return !cancelled;
        });
    }
    return Promise.resolve(true);
}

data.mountVirtualApi("packetio", {
    getSync: handlePacketIOApi
});
