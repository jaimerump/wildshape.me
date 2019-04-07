import styled from 'styled-components';

export const PageContainer = styled.main.attrs({ className: 'page-container' })`
  padding: 4em 2em;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  overflow: auto;
`;

export default PageContainer;
