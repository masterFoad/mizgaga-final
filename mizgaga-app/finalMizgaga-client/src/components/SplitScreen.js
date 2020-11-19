import React, {Component} from 'react';
import SplitterLayout from 'react-splitter-layout';
import ModelData from "./ModelData";
import styles from './SplitScreen-css.css';

//  let pg = new PlayGround('ws://192.168.43.173:81/', {DOM: document.getElementById('app')})
// eslint-disable-next-line react/prop-types

// {/*<SplitterLayout vertical={true} percentage={true} primaryMinSize={70} secondaryMinSize={30}>*/}
// {/*    <div style={{display: this.props.connectionReady ? 'block' : 'none'}} id="3dApp"></div>*/}
// {/*    <div id="reactroot" style={{height: "400px", display: this.props.connectionReady ? 'block' : 'none'}}>*/}
// {/*        <ModelData currentFace={this.props.currentFace}/>*/}
// {/*    </div>*/}
// {/*</SplitterLayout>*/}
{/*<div id="container" className={styles.customContainer}>*/
}

{/*    <div id="3dApp" style={{display: this.props.connectionReady ? 'block' : 'none'}}*/
}
{/*         className={styles.mainApp}></div>*/
}
{/*    <div id="reactroot" style={{ display: this.props.connectionReady ? 'block' : 'none'}}*/
}
{/*         className={styles.bottom_div}>*/
}
{/*        <ModelData currentFace={this.props.currentFace}/>*/
}
{/*    </div>*/
}

{/*</div>*/
}

class Splitscreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="frame">
                <div id="result">
                    <div id="3dApp">

                    </div>
                </div>
                <div id="editor" style={{ visibility: this.props.connectionReady ? 'visible' : 'hidden'}}>
                    <ModelData currentFace={this.props.currentFace}/>
                </div>
            </div>
        );
    }
}

Splitscreen.displayName = 'Splitscreen';

export default Splitscreen;
