import React from 'react'
import ReactDom from 'react-dom';
import PullLoad, {STATS} from 'reactjs-pull-load';
console.log(<PullLoad/>, STATS);
console.log(root);
/*
export const STATS = {
    default: 'default', //默认
    reset: 'reset', // 下拉未触发加载
    resetAction: 'resetAction', // 下拉触发加载
    loadingReset: 'loadingReset', // 下拉加载中  加载中状态时 回调额外返回next  接口返回数据要调用next结束等待
    more: 'more', // 上拉未触发加载
    moreAction: 'moreAction', // 上拉触发加载
    loadingMore: 'loadingMore', // 上拉加载中 加载中状态时 回调额外返回next  接口返回数据要调用next结束等待
};
 */
class App extends React.Component {
    list = [0,1];
    pushData() {
        return new Promise((resolve, reject) => {
            setTimeout(_ => {
                resolve(this.list.length)
            }, 300)
        })
    }
    render() {
        return (
            <div>
                <PullLoad
                    //header={<div>自定义header</div>} //可以根据不同状态来改变头部
                    //floor={<div>自定义floor</div>}
                    onDidMount={ev => {

                    }}
                    downEnough = {50} //下拉触发加载高度
                    distanceBottom = {50} //上拉
                    actionHanlde={({state,next})=>{ //回调 返回各种状态
                        console.log(state);
                        switch (state) {
                            case STATS.default:
                                return;
                            case STATS.reset:
                                return;
                            case STATS.resetAction:
                                return;
                            case STATS.loadingReset:
                                this.pushData().then(rep => {
                                    this.list = [0,1];
                                    next && next();
                                    this.setState({});
                                });
                                return;
                            case STATS.more:
                                return;
                            case STATS.moreAction:
                                return;
                            case STATS.loadingMore:
                                this.pushData().then(rep => {
                                    this.list.push(rep);
                                    next && next();
                                    this.setState({});
                                });
                                return;
                        }

                    }}
                    hasMore={true} // 是否有更多 为false不触发上拉
                >
                    {
                        this.list.map(v => {
                            return (
                                <div key={v} style={
                                    {
                                        fontSize: 100,
                                        textAlign: 'center',
                                        lineHeight: '400px',
                                        height: 400,
                                        backgroundColor: v%2 ===0 ? 'red' : 'blue'
                                    }
                                }>{v}</div>
                            )
                        })
                    }
                </PullLoad>
            </div>
        )
    }
}
ReactDom.render(<App/>, root);
