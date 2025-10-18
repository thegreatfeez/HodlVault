import { BrowserRouter, Routes, Route} from "react-router-dom"
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/Wagmi'
import Header from "./components/Header";
import CreateVault from "./Pages/CreateVault";
import Hero from "./Pages/Hero";
import { CreateVaultProvider } from "./contexts/createVaultContext";
import VaultDashboard from "./Pages/VaultDashboard"
import VaultDetails from "./Pages/VaultDetails";


const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CreateVaultProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route index element={<Hero/>}/>
              <Route path="/createvault" element={<CreateVault />} />
              <Route path="/vaultdashboard" element={<VaultDashboard />} />
              <Route path="/vault/:id" element={<VaultDetails />} />
            </Routes>
          </BrowserRouter>
        </CreateVaultProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;