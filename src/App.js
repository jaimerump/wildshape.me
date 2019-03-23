import React, { Component } from 'react';
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
import CreatureCard from './containers/CreatureCard/';
import Nav from './containers/Nav/';

//  components
import PageContainer from './components/PageContainer/';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Nav>
          <NavItem>Wildshape.me</NavItem>
        </Nav>
        <PageContainer>
          <CreatureCard creature={ Creatures[0] } character={ Characters[0] } />
        </PageContainer>
      </div>
    );
  }
}

export default App;
