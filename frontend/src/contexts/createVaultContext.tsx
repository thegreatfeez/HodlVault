import { createContext, useState} from "react";
import type { ReactNode } from "react";

type CreateVaultContextType = {
    vaultName: string,
    targetAmount: number
    duration: number,
    setVaultName:(name:string) => void,
    setTargetAmount:(amount:number) => void,
    setDuration:(duration:number) => void 
}

export const CreateVaultContext = createContext<CreateVaultContextType | null>(null);

export const CreateVaultProvider = ({ children }: { children: ReactNode }) => {
  const [vaultName, setVaultName] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [duration, setDuration] = useState(0);

  return (
    <CreateVaultContext.Provider
      value={{
        vaultName,
        targetAmount,
        duration,
        setVaultName,
        setTargetAmount,
        setDuration,
      }}
    >
      {children}
    </CreateVaultContext.Provider>
  );
};

