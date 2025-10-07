import { CiVault } from "react-icons/ci";
import {Link, useLocation} from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const isHeroPage = location.pathname === "/";
  return (
    <header className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between shadow-sm">
     
     <Link to="/">
      <div className="flex items-center space-x-2">
        <CiVault className="text-blue-500" size={28} />
        <span className="font-semibold text-lg">HodlVault</span>
      </div>
      </Link>

  
        {!isHeroPage && (
        <nav className="hidden md:flex space-x-6 text-sm text-gray-300">
          <Link to="/vaultdashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/createvault" className="hover:text-white transition-colors">
            Create Vault
          </Link>
        </nav>
      )}

      
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition">
        Connect Wallet
      </button>
    </header>
  );
}
