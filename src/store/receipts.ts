import { create } from "zustand";
import type { DemoCase, SignedReceipt } from "@/lib/fulfillment";
import { buildDemoLibrary } from "@/lib/fulfillment";
import type { RunContext } from "@/lib/fulfillment/workshop";

type ReceiptState = {
  ready: boolean;
  error: string | null;
  receipts: SignedReceipt[];
  cases: DemoCase[];
  runs: Record<string, RunContext>;
  liveIds: string[];
  seed: () => Promise<void>;
  put: (receipt: SignedReceipt) => void;
  putLive: (receipt: SignedReceipt, context: RunContext) => void;
  byId: (id: string) => SignedReceipt | undefined;
  runFor: (id: string) => RunContext | undefined;
};

let seeding: Promise<void> | null = null;

export const useReceipts = create<ReceiptState>((set, get) => ({
  ready: false,
  error: null,
  receipts: [],
  cases: [],
  runs: {},
  liveIds: [],
  seed: async () => {
    if (get().ready) return;
    if (seeding) return seeding;
    seeding = (async () => {
      try {
        const lib = await buildDemoLibrary();
        set({ ready: true, receipts: lib.receipts, cases: lib.cases, error: null });
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : "Could not build demo receipts",
        });
      } finally {
        seeding = null;
      }
    })();
    return seeding;
  },
  put: (receipt) => {
    set((s) => ({
      receipts: [receipt, ...s.receipts.filter((r) => r.receipt_id !== receipt.receipt_id)],
    }));
  },
  putLive: (receipt, context) => {
    set((s) => ({
      receipts: [receipt, ...s.receipts.filter((r) => r.receipt_id !== receipt.receipt_id)],
      runs: { ...s.runs, [receipt.receipt_id]: context },
      liveIds: [receipt.receipt_id, ...s.liveIds.filter((id) => id !== receipt.receipt_id)],
    }));
  },
  byId: (id) => get().receipts.find((r) => r.receipt_id === id),
  runFor: (id) => get().runs[id],
}));
