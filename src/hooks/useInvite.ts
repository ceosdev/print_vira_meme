import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { shareInvite } from '@/config/app';
import { services } from '@/services';

export type InviteResult = 'whatsapp' | 'sheet' | 'error';

/**
 * Convite para instalar o app. No Android não dá para mandar imagem e texto na mesma ação
 * (o meme vai como imagem pura), então o convite é uma ação própria: abre direto a conversa
 * do WhatsApp com o texto pronto e, se o WhatsApp não estiver instalado, cai na share sheet.
 *
 * Usamos openURL + catch em vez de canOpenURL: no Android 11+ o canOpenURL exige declarar
 * <queries> no manifesto e devolveria false mesmo com o app instalado.
 */
export function useInvite() {
  const [busy, setBusy] = useState(false);

  const invite = useCallback(async (): Promise<InviteResult> => {
    setBusy(true);
    const message = shareInvite();
    try {
      await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
      return 'whatsapp';
    } catch {
      const outcome = await services.share.shareText(message);
      return outcome === 'opened' ? 'sheet' : 'error';
    } finally {
      setBusy(false);
    }
  }, []);

  return { invite, busy };
}
