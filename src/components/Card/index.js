import styled from 'styled-components';

import cssVars from '../../cssVariables';

export const Card = styled.article.attrs({ className: 'card' })`
  max-width: 30rem;
  height: 100%;
  /* padding: 2em; */

  border-radius: ${cssVars.BORDER_RADIUS};

  display: grid;
  grid-template-areas: 'card-header' 'card-body';
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
`;

export default Card;
