import * as React from "react";
import { connect } from 'react-redux';

import { SkillMapState } from '../store/reducer';
import { ActivityActions } from './ActivityActions';
import { RewardActions } from './RewardActions';
import { MapActions } from './MapActions';

import { ActivityStatus, isActivityUnlocked, isMapUnlocked, lookupActivityProgress,
    isActivityCompleted, getActivityStatus, isRewardNode } from '../lib/skillMapUtils';

/* tslint:disable:no-import-side-effect */
import '../styles/infopanel.css'
/* tslint:enable:no-import-side-effect */

interface InfoPanelProps {
    mapId: string;
    title: string;
    subtitle?: string;
    description: string;
    imageUrl?: string;
    details?: string[];
    node?: MapNode;
    status?: ActivityStatus;
}

export class InfoPanelImpl extends React.Component<InfoPanelProps> {
    protected getStatusLabel(status?: ActivityStatus) {
        switch (status) {
            case "locked":
                return lf("Locked");
            case "completed":
                return lf("Completed");
            default:
                return null;
        }
    }

    protected getStatusIcon(status?: ActivityStatus) {
        switch (status) {
            case "locked":
                return "lock";
            case "completed":
                return "check circle";
            default:
                return null;
        }
    }

    render() {
        const  { mapId, title, subtitle, description, imageUrl, details, node, status  } = this.props;
        const statusLabel = this.getStatusLabel(status);
        const isActivity = node && !isRewardNode(node);
        const tags = isActivity && (node as MapActivity).tags || undefined;
        return <div className="info-panel">
            <div className="info-panel-image">
                {imageUrl
                ? <img src={imageUrl} alt={lf("Preview of activity content")} />
                : <i className={`icon image`} />}
            </div>
            <div className="info-panel-content">
                {subtitle && <div className="info-panel-subtitle">{subtitle}</div>}
                <div className="info-panel-title">{title}</div>
                {statusLabel && <div className="info-panel-label">
                    <i className={`ui icon ${this.getStatusIcon(status)}`} />
                    <span>{statusLabel}</span>
                </div>}
                <div className="info-panel-description">{description}</div>
                {tags && tags.length > 0 && <div className="info-panel-tags">
                    {tags.map((el, i) => <div key={i}>{el}</div>)}
                </div>}
                <div className="info-panel-detail">
                    {details?.map((el, i) => <div key={`detail_${i}`}>{el}</div>)}
                </div>
                <div className="tablet-spacer" />
                {node && (isActivity
                    ? <ActivityActions mapId={mapId} activityId={node.activityId} status={status} />
                    : <RewardActions mapId={mapId} activityId={node.activityId} status={status} type={(node as MapReward).type} />)
                }
            </div>
        </div>
    }
}

function mapStateToProps(state: SkillMapState, ownProps: any) {
    const { user, pageSourceUrl, maps, selectedItem } = state;
    const node = selectedItem && state.maps[selectedItem.mapId]?.activities[selectedItem.activityId];
    const isActivity = node?.kind === "activity";

    const details: string[] = [];
    let status: ActivityStatus | undefined;
    let subtitle: string | undefined;

    if (maps) {
        if (selectedItem?.activityId && maps[selectedItem.mapId]) {
            const map = maps[selectedItem.mapId];
            const { status: activityStatus, currentStep, maxSteps } = getActivityStatus(state.user, state.pageSourceUrl, map, selectedItem.activityId);
            status = activityStatus;
            if (isActivity) {
                details.push(maxSteps ? `${currentStep}/${maxSteps} ${lf("Steps")}` : lf("Not Started"));
                details.push(isActivity ? (node as MapActivity).type : "");
            }
            if (map) subtitle = map.displayName
        } else if (user) {
            // Count of completed activities (not including reward nodes)
            const mapIds = Object.keys(maps);
            let completed = 0;
            let total = 0;
            let rewards = 0;
            mapIds.forEach(mapId => {
                const activities = maps[mapId].activities;
                const activityIds = Object.keys(activities).filter(el => activities[el].kind == "activity");
                activityIds.forEach(activityId => ++total && isActivityCompleted(user, pageSourceUrl, mapId, activityId) && ++completed);

                rewards += Object.keys(activities).filter(el => isRewardNode(activities[el])).length;
            })

            details.push(`${completed}/${total} ${lf("Complete")}`);
            details.push(rewards ? `${rewards} ${lf("Reward(s)")}` : "")
        }
    }

    return {
        mapId: selectedItem?.mapId,
        title: node?.displayName || state.title,
        subtitle,
        description: isActivity ? (node as MapActivity).description : state.description,
        imageUrl: node ? node?.imageUrl : state.bannerImageUrl,
        node,
        status,
        details
    };
}

export const InfoPanel = connect(mapStateToProps)(InfoPanelImpl);