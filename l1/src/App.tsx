import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getCollectorName } from "./lib/collector";
import { I18nContext } from "./lib/i18n";
import { getLang, subscribeLang, getDictFor } from "./lib/langStore";
import type { Lang } from "./lib/types";
import Layout from "./components/Layout";
import EnterName from "./pages/collector/EnterName";
import NewLot from "./pages/collector/NewLot";
import PriceBoard from "./pages/collector/PriceBoard";
import Recyclers from "./pages/collector/Recyclers";
import Handover from "./pages/collector/Handover";
import Ledger from "./pages/collector/Ledger";
import Safety from "./pages/collector/Safety";
import TraceView from "./pages/collector/TraceView";
import CollectorHome from "./pages/collector/Home";
import RecyclerInbox from "./pages/recycler/Inbox";

function RequireName({ children }: { children: React.ReactNode }) {
  const [name] = useState<string | null>(() => getCollectorName());
  if (!name) return <Navigate to="/collector/enter" replace />;
  return <>{children}</>;
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => getLang());
  useEffect(() => subscribeLang(() => setLang(getLang())), []);
  const t = useMemo(() => getDictFor(lang), [lang]);

  return (
    <I18nContext.Provider value={{ lang, t }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/collector" replace />} />

          {/* Collector routes */}
          <Route path="/collector" element={<Layout />}>
            <Route index element={<RequireName><CollectorHome /></RequireName>} />
            <Route path="enter" element={<EnterName />} />
            <Route path="new-lot" element={<RequireName><NewLot /></RequireName>} />
            <Route path="prices" element={<RequireName><PriceBoard /></RequireName>} />
            <Route path="recyclers" element={<RequireName><Recyclers /></RequireName>} />
            <Route path="handover" element={<RequireName><Handover /></RequireName>} />
            <Route path="ledger" element={<RequireName><Ledger /></RequireName>} />
            <Route path="safety" element={<RequireName><Safety /></RequireName>} />
            <Route path="trace" element={<RequireName><TraceView /></RequireName>} />
          </Route>

          {/* Recycler routes */}
          <Route path="/recycler" element={<RecyclerInbox />} />
        </Routes>
      </BrowserRouter>
    </I18nContext.Provider>
  );
}
