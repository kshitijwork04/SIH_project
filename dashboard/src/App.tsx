import { Navigate, Route, Routes } from "react-router-dom";
import { repo } from "./lib/repository";
import { useApp } from "./lib/store";
import { useRepoSync } from "./lib/useRepoSync";
import Onboarding from "./pages/collector/Onboarding";
import CollectorShell from "./pages/collector/CollectorShell";
import Home from "./pages/collector/Home";
import NewLot from "./pages/collector/NewLot";
import PriceBoard from "./pages/collector/PriceBoard";
import Matching from "./pages/collector/Matching";
import Handover from "./pages/collector/Handover";
import Ledger from "./pages/collector/Ledger";
import Safety from "./pages/collector/Safety";
import RecyclerLogin from "./pages/recycler/RecyclerLogin";
import RecyclerShell from "./pages/recycler/RecyclerShell";
import Inbox from "./pages/recycler/Inbox";
import LotDetail from "./pages/recycler/LotDetail";

export default function App() {
  // Re-render on every repo change so the onboarding guard reads LIVE state.
  // Without this, React Router re-renders <Routes> internally but NOT the App
  // function body, so `onboarded` stays stale and routing loops back to /onboarding.
  useApp();
  useRepoSync();
  const onboarded = repo.isOnboarded();

  return (
    <Routes>
      <Route
        path="/"
        element={onboarded ? <Navigate to="/home" replace /> : <Onboarding />}
      />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route
        element={
          onboarded ? <CollectorShell /> : <Navigate to="/onboarding" replace />
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/new-lot" element={<NewLot />} />
        <Route path="/prices" element={<PriceBoard />} />
        <Route path="/match/:lotId" element={<Matching />} />
        <Route path="/handover/:lotId" element={<Handover />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/safety" element={<Safety />} />
      </Route>

      <Route path="/recycler" element={<RecyclerLogin />} />
      <Route element={<RecyclerShell />}>
        <Route path="/recycler/inbox" element={<Inbox />} />
        <Route path="/recycler/lot/:lotId" element={<LotDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
