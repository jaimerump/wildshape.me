import styled from 'styled-components';
import Select from 'react-select';

export const SelectStyled = styled(Select).attrs({ className: 'select-styled' })`
  /* flex-basis: 0;
  flex-grow: 1; */

  min-width: 14rem;
`;

export default SelectStyled;
