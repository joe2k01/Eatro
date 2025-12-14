import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";

type IconButtonProps = ComponentProps<typeof MaterialIcons.Button>;

export function IconButton({ children, ...props }: IconButtonProps) {
  return <MaterialIcons.Button {...props}>{children}</MaterialIcons.Button>;
}
