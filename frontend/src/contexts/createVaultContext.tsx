import { createContext, useState, useContext} from "react";
import type { ReactNode } from "react";

type CreateVaultContextType = {
    vaultName: string,
    targetAmount: number
    duration: number,
    setVaultName:(name:string) => void,
    setTargetAmount:(amount:number) => void,
    setDuration:(duration:number) => void 
}

const CreateVaultContext = createContext<CreateVaultContextType | null>(null);
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

export const useCreateVault = () => {
    const context  = useContext(CreateVaultContext);
    if(!context) {
        throw new Error("useCreateVault must be used within a CreateVaultProvider");
    }
    return context;
}

