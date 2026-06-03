interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const toasts = ref<Toast[]>([]);
let seq = 0;

export function useToast() {
  const push = (message: string, type: Toast["type"] = "success") => {
    const id = ++seq;
    toasts.value = [...toasts.value, { id, message, type }];
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 2600);
  };

  return {
    toasts,
    success: (m: string) => push(m, "success"),
    error: (m: string) => push(m, "error"),
  };
}
