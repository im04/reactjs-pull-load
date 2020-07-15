"use strict";
import React, { Component } from "react";
import style from "./pullLoad.css";

function addEvent(obj, type, fn) {
  if (obj.attachEvent) {
    obj["e" + type + fn] = fn;
    obj[type + fn] = function() {
      obj["e" + type + fn](window.event);
    };
    obj.attachEvent("on" + type, obj[type + fn]);
  } else
    obj.addEventListener(
      type,
      fn,
      {
        passive: false,
      },
      false
    );
}

function removeEvent(obj, type, fn) {
  if (obj.detachEvent) {
    obj.detachEvent("on" + type, obj[type + fn]);
    obj[type + fn] = null;
  } else obj.removeEventListener(type, fn, false);
}

export const STATS = {
  default: "default",
  refreshCheck: "refreshCheck",
  refreshMeet: "refreshMeet",
  refreshLoading: "refreshLoading",
  moreAction: "moreAction",
  loadingMore: "loadingMore",
  scrolling: "scrolling"
};

export default class PullLoad extends Component {
  componentDidMount() {
    this.container = this.refs.container;
    this.scrollBody = this.refs.scrollBody;
    this.content = this.refs.content;
    this.header = this.refs.header;
    this.floor = this.refs.floor;
    const {
      downEnough,
      distanceBottom,
      actionHandler,
      onDidMount,
    } = this.props;
    this.downEnough = downEnough || 50;
    this.distanceBottom = distanceBottom || 15;
    this.actionHandler = actionHandler;
    addEvent(this.scrollBody, "touchstart", this.onTouchStart);
    addEvent(this.scrollBody, "touchmove", this.onTouchMove);
    addEvent(this.scrollBody, "touchend", this.onTouchEnd);
    addEvent(this.scrollBody, "scroll", this.onScroll);
    this.checkInSide();
    onDidMount &&
      onDidMount({
        container: this.container,
        scrollBody: this.scrollBody,
        content: this.content,
        header: this.header,
        floor: this.floor,
      });
  }
  componentDidUpdate() {
    this.checkInSide();
  }
  componentWillUnmount() {
    removeEvent(this.scrollBody, "touchstart", this.onTouchStart);
    removeEvent(this.scrollBody, "touchmove", this.onTouchMove);
    removeEvent(this.scrollBody, "touchend", this.onTouchEnd);
    removeEvent(this.scrollBody, "scroll", this.onScroll);
  }
  easing(distance, d) {
    let t = distance / 2;
    let b = 0;
    let c = d / 2;
    return c * Math.sin((t / d) * (Math.PI / 2)) + b;
  };
  onScroll = ev => {
    if (this.STATS !== STATS.default && this.STATS !== STATS.scrolling) return;
    if (this.props.noMore) return;
    let scrollTop = ev.target.scrollTop;
    let scrollHeight = this.scrollBody.clientHeight;
    let contentHeight = this.content.clientHeight;
    if (scrollTop >= (contentHeight - scrollHeight - this.distanceBottom)) {
      this.loadingMore();
    }
  };
  startY = 0;
  STATS = STATS.default;
  onTouchStart = ev => {
    if (this.STATS !== STATS.default) return ev.cancelable && ev.preventDefault();
    let targetEvent = event.touches[0];
    this.startY = targetEvent.clientY;
  };
  onTouchMove = ev => {
    if (
      this.STATS !== STATS.default &&
      this.STATS !== STATS.refreshCheck &&
      this.STATS !== STATS.refreshMeet
    )
      return;
    let touches = ev.touches;
    if (touches && touches.length > 1) {
      return;
    }
    let scrollTop = this.scrollBody.scrollTop;
    if (scrollTop > 0) {
      this.STATS !== STATS.scrolling&&(this.STATS = STATS.scrolling);
      return;
    }
    let targetEvent = touches[0],
      curY = targetEvent.clientY,
      diffY = curY - this.startY,
      Y;
    if (diffY <= 0) return;
    let height = this.scrollBody.clientHeight;
    Y = this.easing(diffY, height);
    this.addClass(this.header, style.action);
    this.setSlate(this.container, Y);
    this.changeState(
      this.downEnough < Y ? STATS.refreshMeet : STATS.refreshCheck,
      _ => this.actionState()
    );
    ev.cancelable && ev.preventDefault();
  };
  onTouchEnd = _ => {
    console.log('onTouchEnd', this.STATS);
    switch (this.STATS) {
      case STATS.default:
        return;
      case STATS.refreshCheck:
        this.setSlateEnd(this.container, 0, _ => {
          this.removeClass(this.header, style.action);
          this.changeState(STATS.default);
        });
        break;
      case STATS.refreshMeet:
        this.changeState(STATS.refreshLoading);
        this.setSlateEnd(this.container, this.downEnough, _ => {
          this.actionState(_ => {
            this.setSlateEnd(this.container, 0, _ => {
              this.removeClass(this.header, style.action);
              this.changeState(STATS.default);
            });
          });
        });
        break;
      default:
        this.STATS = STATS.default;
        break;
    }
    return true;
  };
  setSlate(target, pullHeight) {
    target.style.transform = `translate3d(0, ${pullHeight}px, 0)`;
  };
  setSlateEnd(target, pullHeight, endCallback) {
    addEvent(target, "transitionend", function end() {
      target.style.transition = null;
      removeEvent(target, "transitionend", end);
      endCallback && endCallback();
    });
    target.style.cssText = `transform:translate3d(0, ${pullHeight}px, 0);transition: transform 250ms ease-in-out`;
  };
  addClass(target, className) {
    let cl = target.classList;
    !cl.contains(className) && cl.add(className);
  }
  removeClass(target, className) {
    let cl = target.classList;
    cl.contains(className) && cl.remove(className);
  }
  changeState(status, callBack) {
    if (this.STATS !== status) {
      this.STATS = status;
      this.setState({},callBack);
      return true;
    } else {
      return false;
    }
  }
  actionState(next) {
    let params = {
      state: this.STATS,
    };
    if (next) {
      params.next = next;
    }
    typeof this.actionHandler === 'function' && this.actionHandler(params);
    this.setState({});
  }
  loadingMore() {
    this.changeState(STATS.loadingMore, _ => {
      this.actionState(_ => {
        this.changeState(STATS.default);
      });
    });
  }
  checkInSide() {
    if (this.content.clientHeight <= this.scrollBody.clientHeight) {
      this.loadingMore();
    }
  }
  setHeader() {
    switch (this.STATS) {
      case STATS.refreshCheck:
        return "下拉刷新";
      case STATS.refreshMeet:
        return "松开刷新";
      case STATS.refreshLoading:
        return "加载中";
    }
  }
  setFloor() {
    if (this.props.noMore) return "没有更多";
    switch (this.STATS) {
      case STATS.loadingMore:
        return "加载中";
      default:
        return "上拉加载";
    }
  }
  render() {
    let { header, floor, children, className } = this.props;
    let { downEnough } = this;
    return (
      <div
        className={style.container + (className ? ` ${className}` : "")}
        ref="container"
      >
        <div className={style.header} ref="header">
          {header || (
            <div
              style={{
                lineHeight: `${downEnough}px`,
                minHeight: downEnough,
              }}
              className={style.default}
            >
              {this.setHeader()}
            </div>
          )}
        </div>
        <div className={style.body} ref="scrollBody">
          <div className={style.scrollBody} ref="content">
            {children}
            <div ref="floor" className={style.floor}>
              {floor || (
                <div className={style.default}>
                  {this.setFloor()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
