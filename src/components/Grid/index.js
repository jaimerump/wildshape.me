import styled from 'styled-components';

// import cssVar from 'cssVariables';

const MARGIN_LARGE = 2;
const MARGIN_MEDIUM = 3.4;
const MARGIN_SMALL = 1;

const Grid = styled.div.attrs({ className: 'grid' })`
  flex-grow: 1;
  max-width: 128rem;
  width: 100%;

  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  grid-auto-rows: 15rem;
  grid-auto-flow: row dense;

  &.large {
    max-width: 128rem;
    margin: ${MARGIN_LARGE}rem auto;

    grid-gap: ${MARGIN_LARGE}rem;
    /* grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr)); */
    grid-template-columns: repeat(auto-fit, minmax(25rem, 30rem));
    grid-auto-rows: 25rem;

    .grid-item__header p {
      width: 25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &.medium {
    max-width: 90rem;
    margin: ${MARGIN_MEDIUM}rem auto;

    grid-gap: ${MARGIN_MEDIUM}rem;
    grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
    grid-auto-rows: 32rem;
  }

  &.small {
    max-width: 90rem;
    margin: ${MARGIN_SMALL}em auto;

    grid-gap: ${MARGIN_SMALL}em;
    /* grid-template-columns: repeat(auto-fit, minmax(19rem, 26rem)); */
    grid-template-columns: repeat(auto-fit, minmax(20rem, 20rem));
    grid-template-rows: repeat(auto-fit, minmax(1fr, 1fr));
  }

  &.center {
    justify-content: center;
  }

  .primary {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .secondary {
    grid-column: span 2;
  }

  .horizontal {
    grid-column: span 2;
  }

  .vertical {
    grid-row: span 2;
  }

  .favorite {
    grid-column: span 2;
    grid-row: span 2;
  }
`;

export default Grid;
