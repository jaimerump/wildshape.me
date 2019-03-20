import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';

import {
  Navbar,
  NavItem
} from 'react-materialize';
import Materialize from 'materialize-css';

import Characters from "./data/characters";
import Creatures from './data/beasts';
import CreatureCard from './components/CreatureCard';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar>
          <NavItem>Wildshape.me</NavItem>
        </Navbar>
        <CreatureCard creature={ Creatures[0] } character={ Characters[0] } />
      </div>
    );
  }
}

export default App;
