import React from 'react'
import ReactDom from 'react-dom';
import PullLoad, {STATS} from '../src/pullLoad';
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
    list = [];
    state = {
        noMore: false
    }
    componentDidMount() {
        setTimeout(_ => {
            this.list = [0];
            this.setState({});
        }, 600)
    }
    pushData() {
        return new Promise((resolve, reject) => {
            setTimeout(_ => {
                resolve(this.list.length)
            }, 300)
        })
    }
    render() {
        let {
            noMore
        } = this.state;
        return (
            <div style={{width:'100%',height:'100%',overflow:'hidden',position:'absolute',top:0,left:0}}>
                <PullLoad
                    //header={<div>自定义header</div>} //可以根据不同状态来改变头部
                    //floor={<div>自定义floor</div>}
                    onDidMount={ev => {

                    }}
                    downEnough = {50} //下拉触发加载高度
                    distanceBottom = {15} //上拉
                    actionHandler={({state,next})=>{ //回调 返回各种状态
                        switch (state) {
                            case STATS.default:
                                return;
                            case STATS.refreshCheck:
                                return;
                            case STATS.refreshMeet:
                                return;
                            case STATS.refreshLoading:
                                this.pushData().then(rep => {
                                    this.list = [0];
                                    next && next();
                                    this.setState({noMore:false});
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
                                    this.setState({noMore:this.list.length > 10});
                                });
                                return;
                        }

                    }}
                    noMore={noMore} // 是否有更多 为false不触发上拉
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
