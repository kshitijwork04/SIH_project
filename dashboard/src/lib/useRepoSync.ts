import { useEffect, useState } from "react";
import { repo, subscribe } from "./repository";

// Subscribes the calling component to repo changes so localStorage writes
// re-render the UI (simulating the offline sync-queue events on mobile).
export function useRepoSync(): void {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  void repo;
}
