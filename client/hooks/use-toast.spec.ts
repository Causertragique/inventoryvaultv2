import { describe, it, expect } from "vitest";
import { reducer } from "./use-toast";

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  open?: boolean;
}

describe("use-toast reducer", () => {
  it("adds a toast", () => {
    const state = { toasts: [] as ToastProps[] };
    const next = reducer(state as any, {
      type: "ADD_TOAST",
      toast: { id: "1", title: "Hello", open: true } as any,
    });
    expect(next.toasts.length).toBe(1);
    expect(next.toasts[0].id).toBe("1");
    expect(next.toasts[0].open).toBe(true);
  });

  it("updates a toast by id", () => {
    const state = { toasts: [{ id: "1", title: "Hello", open: true }] as ToastProps[] };
    const next = reducer(state as any, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "Updated" } as any,
    });
    expect(next.toasts[0].title).toBe("Updated");
  });

  it("dismisses a toast (sets open=false)", () => {
    const state = { toasts: [{ id: "1", title: "Hello", open: true }] as ToastProps[] };
    const next = reducer(state as any, {
      type: "DISMISS_TOAST",
      toastId: "1",
    });
    expect(next.toasts[0].open).toBe(false);
  });

  it("removes a specific toast", () => {
    const state = { toasts: [{ id: "1" }, { id: "2" }] as ToastProps[] };
    const next = reducer(state as any, {
      type: "REMOVE_TOAST",
      toastId: "1",
    });
    expect(next.toasts.map(t => t.id)).toEqual(["2"]);
  });

  it("clears all toasts when toastId undefined on REMOVE_TOAST", () => {
    const state = { toasts: [{ id: "1" }, { id: "2" }] as ToastProps[] };
    const next = reducer(state as any, {
      type: "REMOVE_TOAST",
      toastId: undefined,
    });
    expect(next.toasts.length).toBe(0);
  });
});
