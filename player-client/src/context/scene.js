import { createContext, useState } from "react";

export const SceneContext = createContext(null);

export function SceneProvider({ children }) {
  const [scene, setScene] = useState(0);

  return <SceneContext.Provider value={{ scene, setScene }}>{children}</SceneContext.Provider>;
}
