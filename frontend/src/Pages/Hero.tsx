import vaultBg from "../assets/vault.jpg";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center text-white py-45 px-6 bg-cover bg-center"
      style={{
        backgroundImage: `url(${vaultBg})`,
      }}
    >
     
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"></div>

      
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Lock Your <span className="text-blue-500">ETH</span>,{" "}
          <br className="hidden md:block" />
          Unlock <span className="text-blue-500">Your Goals</span>
        </h1>

        <p className="text-gray-300 mt-6 text-base md:text-lg">
          Vaultify is a decentralized application that helps you lock your ETH for savings goals with time restrictions.
          Create a vault, set your goal, and secure your ETH until you reach your target date.
          It's a transparent and secure way to save for your future.
        </p>

        <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg text-sm md:text-base transition">
          <Link to="/createvault">
          Create New Vault
          </Link>
        </button>
      </div>
    </section>
  );
}
