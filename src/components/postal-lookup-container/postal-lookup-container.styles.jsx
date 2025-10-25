import styled from "styled-components";

export const WrapInputContent = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
`;

export const WrapInput = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;

   @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
  }

`;

export const Card = styled.div`
  background-color: #fff;
  border-radius: 18px;
  background-color: #000;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.9);
  padding: 20px;
  margin: 20px;
  transition: transform 0.25s ease-out;

  &:hover {
    transform: scale(1.05);
  }

    @media (max-width: 900px) {
    & {
      width: 270px;
    }
  }
`;

export const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

export const SubtitleHeading = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export const Subtitle = styled.h4`
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
`;

export const Text = styled.p`
  font-size: 16px;
  font-weight: 400;
  margin: 0px 2px;
  display: inline-block;
`;
