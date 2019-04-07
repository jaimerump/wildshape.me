import styled from 'styled-components';

import cssVars from '../../cssVariables';

const GridItem = styled.div.attrs({ className: 'grid-item' })`
  position: relative;

  background-color: white;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export default GridItem;
