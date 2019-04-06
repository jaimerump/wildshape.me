import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
// import logo from './logo.svg';
// import './App.css';

import {
  // Navbar,
  NavItem
} from 'react-materialize';
import 'materialize-css';

import Characters from "./data/characters";
import Creatures from './data/beasts';

//  containers
import Nav from './containers/Nav/';

//  components
import PageContainer from './components/PageContainer/';

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

          <Route exact path="/" component={CardPage} />
          <Route path="/decks" component={DeckPage} />
          <Route component={NotFoundPage} />
        </Router>
      </div>
    );
  }
}

export default App;
