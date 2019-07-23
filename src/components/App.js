import React from 'react';
import AppShell from './AppShell'
import { HashRouter as Router, Route } from 'react-router-dom';
import Home from './Home';
import Texts from './Texts';
import Words from './Words';
import Detail from './Detail';

// Route를 쓰려면 Router로 감싸줘야한다.

class App extends React.Component {
    render() {
        return (
            <Router>
                <AppShell>
                    <div>
                        <Route exact path="/" component={Home}/>
                        <Route exact path="/texts" component={Texts}/>
                        <Route exact path="/words" component={Words}/>
                        <Route exact path="/detail/:textID" component={Detail}/>
                    </div>
                </AppShell>
            </Router>
        );
    }
}

export default App;