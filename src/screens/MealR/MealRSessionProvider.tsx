import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GetProductDetails } from "@api/validators/getProductDetails";
import type { MealRSessionItem, MealRSessionTotals } from "./types";
import { computeSessionTotals } from "./utils";

export type MealRFlow =
  | { kind: "session" }
  | { kind: "save" }
  | { kind: "add"; barcode: string; product: GetProductDetails }
  | { kind: "edit"; item: MealRSessionItem };

type MealRSessionContextValue = {
  items: MealRSessionItem[];
  totals: MealRSessionTotals;
  flow: MealRFlow;
  scanning: boolean;

  addItem: (item: MealRSessionItem) => void;
  updateItem: (
    itemId: string,
    update: Partial<Omit<MealRSessionItem, "id">>,
  ) => void;
  deleteItem: (itemId: string) => void;
  clearItems: () => void;

  setFlow: (flow: MealRFlow) => void;
  returnToSession: () => void;
};

const MealRSessionContext = createContext<MealRSessionContextValue | null>(
  null,
);

const FLOW_SESSION: MealRFlow = { kind: "session" };

export function MealRSessionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MealRSessionItem[]>([]);
  const [flow, setFlowState] = useState<MealRFlow>(FLOW_SESSION);
  const [scanning, setScanning] = useState(true);

  const totals = useMemo(() => computeSessionTotals(items), [items]);

  const addItem = useCallback((item: MealRSessionItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const updateItem = useCallback(
    (itemId: string, update: Partial<Omit<MealRSessionItem, "id">>) => {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, ...update } : i)),
      );
    },
    [],
  );

  const deleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const setFlow = useCallback((next: MealRFlow) => {
    setFlowState(next);
    if (next.kind !== "session") {
      setScanning(false);
    }
  }, []);

  const returnToSession = useCallback(() => {
    setFlowState(FLOW_SESSION);
    setScanning(true);
  }, []);

  const value = useMemo<MealRSessionContextValue>(
    () => ({
      items,
      totals,
      flow,
      scanning,
      addItem,
      updateItem,
      deleteItem,
      clearItems,
      setFlow,
      returnToSession,
    }),
    [
      items,
      totals,
      flow,
      scanning,
      addItem,
      updateItem,
      deleteItem,
      clearItems,
      setFlow,
      returnToSession,
    ],
  );

  return (
    <MealRSessionContext.Provider value={value}>
      {children}
    </MealRSessionContext.Provider>
  );
}

export function useMealRSession(): MealRSessionContextValue {
  const ctx = useContext(MealRSessionContext);

  if (!ctx) {
    throw new Error("useMealRSession must be used within MealRSessionProvider");
  }

  return ctx;
}
