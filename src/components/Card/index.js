import styled from 'styled-components';

import cssVars from '../../cssVariables';

export const Card = styled.article.attrs({ className: 'card' })`
  /* background-color: pink; */
  max-width: 30rem;
  height: 100%;
  
  padding: 1em 2em;

  border-radius: ${cssVars.BORDER_RADIUS};

  overflow: auto;
`;

export default Card;
