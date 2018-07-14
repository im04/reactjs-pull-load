import React from 'react'
import ReactDom from 'react-dom';
import PullLoad, {STATS} from 'reactjs-pull-load';
console.log(<PullLoad/>, STATS);
console.log(root);
ReactDom.render(<div>
    <PullLoad
        onDidMount={ev => {
            document.body.addEventListener('scroll',ev => {
                ev.preventDefault();
            },false)
        }}
        actionHanlde={({state,next})=>{
            console.log(state);
            next && setTimeout(next, 100);
        }}
        hasMore={true}
        >
        <div id="scrollT" style={
            {
                height: 500,
                backgroundColor: 'red'
            }
        }/>
        <div style={
            {
                height: 500,
                backgroundColor: 'blue'
            }
        }/>
    </PullLoad>
</div>, root);
