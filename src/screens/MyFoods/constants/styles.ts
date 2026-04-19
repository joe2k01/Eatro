import { StyleSheet } from "react-native";
import { spacing, Typography } from "@constants/theme";

export const myFoodsStyles = StyleSheet.create({
  list: {
    flex: 1,
  },
  tabView: {
    flex: 1,
  },
  tabBarLabel: {
    ...Typography.label,
    textTransform: "none",
  },
  bottomButton: {
    paddingBottom: spacing(2),
  },
});

export const TAB_VIEW_COMMON_OPTIONS = {
  labelStyle: myFoodsStyles.tabBarLabel,
};
