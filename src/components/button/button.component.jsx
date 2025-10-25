import { ButtonBase, ButtonEdit, ButtonDelete } from "./button.styled";

export const BUTTON_TYPE_CLASSES = {
  base: "base",
  edit: "edit",
  delete: "delete",
};

const getButton = (buttonType = BUTTON_TYPE_CLASSES.base) =>
  ({
    [BUTTON_TYPE_CLASSES.base]: ButtonBase,
    [BUTTON_TYPE_CLASSES.edit]: ButtonEdit,
    [BUTTON_TYPE_CLASSES.delete]: ButtonDelete,
  }[buttonType]);

const Button = ({ children, buttonType, ...otherProps }) => {
  const CustomButton = getButton(buttonType);
  return <CustomButton {...otherProps}>{children}</CustomButton>;
};

export default Button;
