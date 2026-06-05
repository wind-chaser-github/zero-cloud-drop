import { Header } from "./components/Header";
import { TransferManager } from "./components/TransferManager";

function App() {
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
      
      <Header />
      
      <main className="flex-1 flex flex-col items-center pt-24 pb-12 relative z-10 w-full">
        <TransferManager />
      </main>
    </div>
  );
}

export default App;
