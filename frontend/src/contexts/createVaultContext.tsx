import { createContext, useState} from "react";
import type {ReactNode} from "react";

export type Vault = {
  id: number;
  name: string;
  targetAmount: number;
  duration: number;
  progress: number;
  startDate: Date;
};

type CreateVaultContextType = {
  vaults: Vault[];
  addVault: (vault: Vault) => void;
  updateVaultProgress: (id: number, progress: number) => void;
};

export const CreateVaultContext = createContext<CreateVaultContextType | null>(null);

export const CreateVaultProvider = ({ children }: { children: ReactNode }) => {
  const [vaults, setVaults] = useState<Vault[]>([]);

 
  const addVault = (vault: Vault) => {
    setVaults((prev) => [...prev, vault]);
  };

  const updateVaultProgress = (id: number, progress: number) => {
    setVaults((prev) =>
      prev.map((v) => (v.id === id ? { ...v, progress } : v))
    );
  };

  return (
    <CreateVaultContext.Provider value={{ vaults, addVault, updateVaultProgress }}>
      {children}
    </CreateVaultContext.Provider>
  );
};
