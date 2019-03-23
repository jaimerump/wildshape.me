import styled from 'styled-components';

export const PageContainer = styled.main.attrs({ className: 'page-container' })`
  height: 100vh;
  width: 100vw;
  padding-top: 6em;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default PageContainer;
