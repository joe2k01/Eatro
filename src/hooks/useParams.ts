import { useRoute } from "@react-navigation/native";
import { RootStackParamsList } from "../AppRoutes";

export function useParams<
  P extends RootStackParamsList[keyof RootStackParamsList],
>(): P {
  const { params } = useRoute();

  return params as P;
}
