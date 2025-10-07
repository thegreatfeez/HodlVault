import { BrowserRouter, Routes, Route} from "react-router-dom"
import Header from "./components/Header";
import CreateVault from "./Pages/CreateVault";
import Hero from "./Pages/Hero";
import { CreateVaultProvider } from "./contexts/createVaultContext";
import VaultDashboard from "./Pages/VaultDashboard"
import VaultDetails from "./Pages/VaultDetails";


function App() {
  return (
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
  );
}

export default App;
