import styled from "styled-components"

export const Input = styled.input`
  min-width: 100px;
  width: 120px;
  height: 50px;
  letter-spacing: 0.5px;
  line-height: 50px;
  padding: 0 25px 0 25px;
  font-size: 15px;
  border: 2px solid #feae1f;
  background-color: black;
  color: #ffffffab;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  margin: 0 10px;
  text-align: center;
  background: transparent;
  transition: all 0.3s ease;

  &:hover {
   
    color: #feae1f;
  }

  @media (max-width: 600px) {
    width: 265px;

    margin: 15px 0;
  }
`