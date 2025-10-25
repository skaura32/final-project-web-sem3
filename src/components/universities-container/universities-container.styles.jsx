import styled from "styled-components";

export const WrapContent = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const CardWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 40%;
  height: 200px;
  padding: 20px;
  border-radius: 18px;
  background-color: #000;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.9);
  margin: 20px;
  transition: transform 0.25s ease-out;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 600px) {
    & {
      flex-basis: 80%;
    }
  }

`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 30%;
`;

export const CardTitle = styled.h4`
  font-size: 24px;
  font-weight: bold;
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50%;
`;

export const CardLink = styled.a`
  color: #0077b6;
  text-decoration: none;
  font-weight: bold;
`;
