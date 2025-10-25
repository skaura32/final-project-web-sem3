import styled from "styled-components";

export const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 40%;
  padding: 20px;
  border-radius: 18px;
  background-color: #000;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.9);
  text-align: center;
  margin: 25px auto;
  transition: transform 0.25s ease-out;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 600px) {
    & {
      flex-basis: 90%;
    }
  }
`;

export const CardHeading = styled.h1`
  font-size: 24px;
  font-weight: bold;
`;

export const CardId = styled.span`
  font-size: 1.5em;
`;

export const CardTitle = styled.p`
    text-align: left;
    margin:0px;

  &::first-letter {
    text-transform: uppercase;
  }
`;

export const CardBody = styled.div`
  margin: 20px auto;
`;

export const CardText = styled.p`
  font-size: 18px;
  text-align: left;
`;

export const CardBottom = styled.div`
  display: flex;
  justify-content: center;
`