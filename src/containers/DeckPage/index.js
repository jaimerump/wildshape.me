import React, { Component } from "react";

//  components
import Grid from '../../components/Grid/';
import GridItem from '../../components/GridItem/';
import InputContainer from '../../components/InputContainer/';
import PageContainer from '../../components/PageContainer/';
import SelectStyled from '../../components/SelectStyled/';

import CreatureCards from '../../containers/CreatureCards/';

import DeckControls from './DeckControls'

//  data
import characters from "../../data/characters";
import beastiary from '../../data/beasts';

class DeckPage extends Component {
  state = {
    // form options
    beastOptions: null, // for select
    characterOptions: null, // for select

    // form state
    characterToAdd: undefined, // which character this deck is for
    beastToAdd: undefined, // if a beast is selected, and about to be added to the deck

    deck: [], // current deck build
  }

  componentWillMount() {
    console.log("<DeckPage />     CWM!");     //  eslint-disable-line no-console
    //  convert creatures into options
    console.log('beastiary: ', beastiary); //  eslint-disable-line no-console
    console.log('characters: ', characters); //  eslint-disable-line no-console
    const beastOptions = beastiary.map(beast => ({
      value: beast,
      label: beast.name,
      formState: 'beastToAdd',
    }))
    const characterOptions = characters.map(character => ({
      value: character,
      label: character.name,
      formState: 'characterToAdd',
    }))
    this.setState({
      beastOptions,
      characterOptions,
    });
  }

  handleSelectChange = e => {
    console.log('e: ', e); //  eslint-disable-line no-console
    this.setState({
      [e.formState]: e,
    });
  }

  addCard = () => {
    const { characterToAdd, beastToAdd } = this.state;

    const newCard = {
      beast: beastToAdd.value,
      character: characterToAdd.value,
    }
    
    this.setState(prevState => ({
      deck: [...prevState.deck, newCard]
    }))
  }
  
  render() {
    const { characterToAdd, beastToAdd, characterOptions, beastOptions } = this.state;
    return (
      <PageContainer>
        <DeckControls>
          <InputContainer>
            <SelectStyled
              value={characterToAdd}
              onChange={this.handleSelectChange}
              options={characterOptions}
            />
          </InputContainer>
          <InputContainer>
            <SelectStyled
              value={beastToAdd}
              onChange={this.handleSelectChange}
              options={beastOptions}
            />
          </InputContainer>
          <InputContainer>
            <button onClick={this.addCard}>
              Add To Deck
            </button>
          </InputContainer>
        </DeckControls>
        <Grid className="medium">
          {this.renderDeck()}
        </Grid>
      </PageContainer>
    );
  }

  renderDeck = () => {
    const { deck } = this.state;
    return deck.map((card, i) => {
      return (
        <GridItem key={i}>
          <CreatureCards creature={card.beast} character={card.character} />
        </GridItem>
      )
    })
  }
}

export default DeckPage;
