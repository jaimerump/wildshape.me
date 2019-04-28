import styled from 'styled-components';

import cssVars from '../../cssVariables';

export const CardBody = styled.div.attrs({ className: 'card-body' })`
  grid-area: card-body;

  padding: 1em 2em;

  overflow: auto;
`;

export default CardBody;
