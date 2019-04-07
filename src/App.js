import React, { Component } from 'react';
import { Switch, BrowserRouter as Router, Route, Link } from "react-router-dom";

//  containers
import Nav from './containers/Nav/';

//  pages
import CardPage from './containers/CardPage/';
import DeckPage from './containers/DeckPage/';
import NotFoundPage from './containers/NotFoundPage/';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Nav>
            <Link to="/">Home</Link>
            <Link to="/decks">Decks</Link>
          </Nav>

          <Switch>
            <Route exact path="/" component={CardPage} />
            <Route exact path="/decks" component={DeckPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
