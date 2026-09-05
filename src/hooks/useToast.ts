import { useToastStore } from '@/store/toastStore';

export function useToast() {
  const show = useToastStore((s) => s.show);
  const hide = useToastStore((s) => s.hide);
  return { show, hide };
}
