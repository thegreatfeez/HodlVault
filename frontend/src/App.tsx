import { BrowserRouter, Routes, Route} from "react-router-dom"
import Header from "./components/Header";
import CreateVault from "./Pages/CreateVault";
import Hero from "./Pages/Hero";
import { CreateVaultProvider } from "./contexts/createVaultContext";


function App() {
  return (
    <CreateVaultProvider>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route index element={<Hero/>}/>
        <Route path="/createvault" element={<CreateVault />} />
      </Routes>
    </BrowserRouter>
    </CreateVaultProvider>
  );
}

export default App;
