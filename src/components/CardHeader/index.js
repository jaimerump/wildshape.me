import styled from 'styled-components';

import cssVars from '../../cssVariables';

export const CardHeader = styled.header.attrs({ className: 'card-header' })`
  grid-area: card-header;
  
  padding: 1em 2em;

  background-color: ${cssVars.CLR_PALE_SPRING_BUD};
  
  border-radius: ${cssVars.BORDER_RADIUS};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`;

export default CardHeader;
