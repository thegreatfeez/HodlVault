import { createContext, useState } from "react";
import type { ReactNode } from "react";

type CreateVaultContextType = {
  vaultId: number;
  vaultName: string;
  targetAmount: number;
  duration: number;
  progress: number;
  startDate: Date;
  setStartDate: (date: Date) => void;
  setVaultId: (id: number) => void;
  setVaultName: (name: string) => void;
  setTargetAmount: (amount: number) => void;
  setDuration: (duration: number) => void;
  setProgress: (progress: number) => void;
};

export const CreateVaultContext = createContext<CreateVaultContextType | null>(null);

export const CreateVaultProvider = ({ children }: { children: ReactNode }) => {
  const [vaultId, setVaultId] = useState<number>(Date.now());
  const [vaultName, setVaultName] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState<Date>(new Date());

  return (
    <CreateVaultContext.Provider
      value={{
        vaultId,
        vaultName,
        targetAmount,
        duration,
        progress,
        startDate,
        setStartDate,
        setVaultId,
        setVaultName,
        setTargetAmount,
        setDuration,
        setProgress,
      }}
    >
      {children}
    </CreateVaultContext.Provider>
  );
};
