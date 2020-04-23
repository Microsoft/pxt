/// <reference path="../../built/pxtlib.d.ts" />

import * as React from "react";
import * as sui from "./sui";

export interface ErrorListProps {
    onSizeChange: () => void,
    listenToErrorChanges: (key: string, onErrorChanges: (errors: pxtc.KsDiagnostic[]) => void) => void,
}
export interface ErrorListState {
    isCollapsed: boolean
    errors: pxtc.KsDiagnostic[],
}

export class ErrorList extends React.Component<ErrorListProps, ErrorListState> {

    constructor(props: ErrorListProps) {
        super(props);

        this.state = {
            isCollapsed: false,
            errors: []
        }

        this.onCollapseClick = this.onCollapseClick.bind(this)
        this.onErrorsChanged = this.onErrorsChanged.bind(this)

        props.listenToErrorChanges("errorList", this.onErrorsChanged);
    }

    render() {
        const {isCollapsed, errors} = this.state;
        const errorsAvailable = !!errors?.length;
        const collapseTooltip = lf("Collapse Error List");
        function errorKey(error: pxtc.KsDiagnostic): string {
            // React likes have a "key" for each element so that it can smartly only
            // re-render what changes. Think of it like a hashcode/
            return `${error.messageText}-${error.fileName}-${error.line}-${error.column}`
        }

        const toggleButton = <sui.Button id='toggleErrorList' className={`toggleErrorList collapse-button large`}
                                icon={`inverted chevron ${isCollapsed ? 'up' : 'down'}`}
                                title={collapseTooltip} onClick={this.onCollapseClick} />

        const errorListInnerClasses = isCollapsed ? "errorListInner errorListSummary" : "errorListInner";

        let viewOptions;
        if (isCollapsed) {
            // Show summarized view
            if (errorsAvailable) {
                viewOptions = <div>{lf("Uh oh! You have {0} error(s)!", errors.length)}</div>
            } else {
                viewOptions = <div>{lf("Good job! You have no errors")}</div>
            }
        } else {
            // show full expanded
            viewOptions = (errors).map(e =>
                            <div key={errorKey(e)}>{`${e.messageText} - [line ${e.line + 1}: col ${e.column + 1}]`}</div>)
        }

        return <div className="errorList" >
            {errorsAvailable && toggleButton}
            <div className={errorListInnerClasses}>
                {viewOptions}
            </div>
        </div>
    }

    componentDidUpdate() {
        // notify parent on possible size change so siblings (monaco)
        // can resize if needed
        this.props.onSizeChange()
    }

    onCollapseClick() {
        this.setState({
            isCollapsed: !this.state.isCollapsed
        })
    }

    onErrorsChanged(errors: pxtc.KsDiagnostic[]) {
        this.setState({
            errors
        })
    }
}