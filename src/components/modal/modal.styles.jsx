import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Modal = styled.div`
  background-color: #242424;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.7);
  padding: 20px;
  max-width: 600px;
  width: 100%;
`;

export const ModalContent = styled.div`

  h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  label {
    font-weight: bold;
    margin-bottom: 10px;
  }

  input,
  textarea {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    resize: vertical;
    font-family: "Helvetica Neue", Arial, sans-serif;
  }

  textarea {
    min-height: 100px;
    height:150px;
    max-height: 200px;
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    min-width: 140px;
    width: auto;
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

    &:hover {
      background-color: #feae1f;
      color: #100F10;
      border: none;
      cursor: pointer;
    }

  }

  button[type="submit"] {
    border: 2px solid #4285f4;
    color: #ffffffab;

    &:hover {
      background-color: #4285f4;
      border: none;
      color: white;
    }
  }

  button[type="button"] {
    border: 2px solid #FF0043;
    color: #ffffffab;

    &:hover {
      background-color: #FF0043;
      border: none;
      color: white;
    }
  }
`;