'use strict';
import React, {Component} from 'react';
import style from './pullLoad.css';

function addEvent(obj, type, fn) {
    if (obj.attachEvent) {
        obj['e' + type + fn] = fn;
        obj[type + fn] = function () { obj['e' + type + fn](window.event); };
        obj.attachEvent('on' + type, obj[type + fn]);
    } else
        obj.addEventListener(type, fn, {
            passive: false
        }, false);
}

function removeEvent(obj, type, fn) {
    if (obj.detachEvent) {
        obj.detachEvent('on' + type, obj[type + fn]);
        obj[type + fn] = null;
    } else
        obj.removeEventListener(type, fn, false);
}

export const STATS = {
    default: 'default',
    reset: 'reset',
    resetAction: 'resetAction',
    loadingReset: 'loadingReset',
    more: 'more',
    moreAction: 'moreAction',
    loadingMore: 'loadingMore',
};

export default class PullLoad extends Component {
    componentDidMount() {
        this.container = this.refs.container;
        this.body = this.refs.body;
        this.scrollBody = this.refs.scrollBody;
        this.header = this.refs.header;
        this.floor = this.refs.floor;
        const {downEnough, distanceBottom, actionHanlde, onDidMount} = this.props;
        this.downEnough = downEnough || 50;
        this.distanceBottom = distanceBottom || 50;
        this.actionHanlder = actionHanlde || new Function();
        addEvent(this.container, "touchstart", this.onTouchStart);
        addEvent(this.container, "touchmove", this.onTouchMove);
        addEvent(this.container, "touchend", this.onTouchEnd);
        onDidMount && onDidMount({
            container: this.container,
            body: this.body,
            scrollBody: this.scrollBody,
            header: this.header,
            floor: this.floor
        });
    }
    componentWillUnmount() {
        removeEvent(this.container, "touchstart", this.onTouchStart);
        removeEvent(this.container, "touchmove", this.onTouchMove);
        removeEvent(this.container, "touchend", this.onTouchEnd);
    };
    easing = (distance, d) => {
        let t = distance / 2;
        let b = 0;
        let c = d / 2.5;
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    };
    startX = 0;
    startY = 0;
    STATS = STATS.default;
    onTouchStart = _ => {
        let targetEvent = event.changedTouches[0];
        this.startX = targetEvent.clientX;
        this.startY = targetEvent.clientY;
        this.cDiffY = 0;
        this.STATS = STATS.default;
    };
    actionState() {
        this.actionHanlder({
            state: this.STATS
        });
        this.setState({});
    }
    onTouchMove = ev => {
        let {
            body,
            container,
        } = this;
        let height = container.clientHeight;
        let scrollTop = container.scrollTop;
        let bodyHeight = body.scrollHeight;
        let targetEvent = ev.changedTouches[0],
            curY = targetEvent.clientY,
            diffY = curY - this.startY,
            dfY = diffY - this.cDiffY,
            Y,
            B;
        switch (true) {
            case dfY > 5 && scrollTop <= 0:
                Y = this.easing(dfY, height);
                this.addClass(this.header, style.action);
                this.setSlate(body, Y);
                if (this.downEnough < Y) {
                    this.changeState(STATS.resetAction, _ => this.actionState())
                } else {
                    this.changeState(STATS.reset, _ => this.actionState());
                }
                break;
            case dfY < -5 && scrollTop >= (B = bodyHeight - height - this.distanceBottom) && this.props.hasMore:
                Y = this.easing(dfY, height);
                this.addClass(this.floor, style.action);
                if (scrollTop - B >= this.distanceBottom) {
                    this.changeState(STATS.moreAction, _ => this.actionState());
                } else {
                    this.changeState(STATS.more, _ => this.actionState());
                }
                break;
            default:
                this.cDiffY = diffY;
        }
        if ((this.STATS === STATS.reset || this.STATS === STATS.resetAction || this.STATS === STATS.loadingReset) && ev.cancelable) {
            ev.preventDefault();
            ev.stopPropagation();
            return false
        }
    };
    onTouchEnd = _ => {
        switch (this.STATS) {
            case STATS.default:
                return;
            case STATS.reset:
                this.setSlateEnd(this.body, 0, _=> {
                    this.removeClass(this.header, style.action);
                    this.changeState(STATS.default);
                });
                break;
            case STATS.resetAction:
                this.changeState(STATS.loadingReset, _ => this.setState({}));
                this.setSlateEnd(this.body, this.downEnough, _=> {
                    this.actionHanlder({
                        state: this.STATS,
                        next: _ => {
                            this.setSlateEnd(this.body, 0, _=> {
                                this.removeClass(this.header, style.action);
                                this.changeState(STATS.default);
                            });
                        }
                    });
                });
                break;
            case STATS.more:
                this.changeState(STATS.loadingMore, _ => {
                    this.actionState();
                    this.changeState(STATS.default);
                });
                break;
            case STATS.moreAction:
                this.changeState(STATS.loadingMore, _ => {
                    this.setState({});
                    this.actionHanlder({
                        state: this.STATS,
                        next: _ => {
                            this.removeClass(this.floor, style.action);
                            this.changeState(STATS.default);
                        }
                    });
                });
                break;
        }
        return true;
    };
    setSlate = (target, pullHeight) => {
        target.style.transform = `translate3d(0, ${pullHeight}px, 0)`
    };
    setSlateEnd = (target, pullHeight, endCallback) => {
        addEvent(target, 'transitionend', function end() {
            target.style.transition = null;
            removeEvent(target, 'transitionend', end);
            endCallback && endCallback();
        });
        target.style = `transform:translate3d(0, ${pullHeight}px, 0);transition: transform .1s ease-in-out`;
    };
    addClass(target, className) {
        let cl = target.classList;
        !cl.contains(className) && cl.add(className)
    }
    removeClass(target, className) {
        let cl = target.classList;
        cl.contains(className) && cl.remove(className)
    }
    changeState(status, callBack) {
        if (this.STATS !== status) {
            this.STATS = status;
            callBack && callBack();
            return true;
        } else {
            return false;
        }
    }
    setHeader() {
        switch (this.STATS) {
            case STATS.reset:
                return '下拉刷新';
            case STATS.resetAction:
                return '松开刷新';
            case STATS.loadingReset:
                return '加载中';
        }
    }
    setFloor() {
        switch (this.STATS) {
            case STATS.more:
                return '上拉加载';
            case STATS.moreAction:
                return '松开加载';
            case STATS.loadingMore:
                return '加载中';
        }
    }
    render() {
        let {
            header,
            floor,
            children,
            className
        } = this.props;
        let {
            distanceBottom,
            downEnough
        } = this;
        return (
            <div className={style.container + (className ? ` ${className}` : '')} ref="container">
                <div className={style.body} ref="body">
                    <div className={style.header} ref="header">


                        {header || <div style={{
                            lineHeight: `${downEnough}px`,
                            minHeight: downEnough
                        }} className={style.default}>{this.setHeader()}</div>}</div>
                    <div className={style.scrollBody} ref="scrollBody">
                        {
                            children
                        }
                    </div>
                    <div ref="floor" className={style.floor}>
                        {floor || <div style={{
                            lineHeight: `${distanceBottom}px`,
                            minHeight: distanceBottom
                        }} className={style.default}>{this.setFloor()}</div>}
                    </div>
                </div>
            </div>
        )
    }
}
