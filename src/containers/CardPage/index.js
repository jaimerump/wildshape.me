import React, { Component } from "react";

//  components
import PageContainer from '../../components/PageContainer/';

//  data
import Characters from "../../data/characters";
import Creatures from '../../data/beasts';

import CreatureCards from '../../containers/CreatureCards/';

class CardPage extends Component {
  render() {
    return (
      <PageContainer>
        <CreatureCards creature={Creatures[0]} character={Characters[0]} />
      </PageContainer>
    );
  }

}

export default CardPage;
