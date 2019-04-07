import styled from 'styled-components';

import cssVars from '../../cssVariables';

const DeckControls = styled.aside.attrs({ className: 'deck-controls' })`
  max-width: ${cssVars.GRID_WIDTH};
  /* min-width: 320px; */
  
  padding: 1em 2em;

  display: flex;
  align-items: center;

  @media only screen and (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export default DeckControls;
