import { Input } from "./input.styled";

const InputComponent = ({ placeholder, onChangeHandler }) => (
    <Input
      type="text"
      placeholder={placeholder}
      onChange={onChangeHandler}
    />
  );
  
  export default InputComponent;