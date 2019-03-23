import styled from 'styled-components';

export const Nav = styled.nav.attrs({ className: 'nav' })`
  position: absolute;  
  top: 0;
  z-index: 99;
  
  width: 100vw;
  padding: 1em 2em;

  background-color: salmon;
`;

export default Nav;
