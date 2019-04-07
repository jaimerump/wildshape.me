import styled from 'styled-components';

export const PageContainer = styled.main.attrs({ className: 'page-container' })`
  padding: 4em 2em 1em;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  overflow: auto;

  @media only screen and (max-width: 600px) {
    padding: 4em 1em 1em;
  }
`;

export default PageContainer;
