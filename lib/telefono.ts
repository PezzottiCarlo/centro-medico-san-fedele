/**
 * Numeri di telefono del centro e dei medici, in un posto solo.
 *
 * In site-config i numeri sono salvati "come si leggono" ("+39 031 33 33 585"):
 * per i link servono senza spazi, e per wa.me senza "+" né "00" iniziale.
 */

/** Solo cifre e "+" iniziale: "+39 031 33 33 585" → "+390313333585". */
export function numeroPulito(numero: string | undefined | null): string {
  if (!numero) return ''
  const pulito = numero.replace(/[^\d+]/g, '')
  return pulito.startsWith('+') ? '+' + pulito.slice(1).replace(/\+/g, '') : pulito.replace(/\+/g, '')
}

/**
 * Link `tel:` o null se il valore non è un numero (es. un campo compilato per
 * errore con "SPECIALISTA IN PSICHIATRIA"): meglio non mostrare il link.
 */
export function telHref(numero: string | undefined | null): string | null {
  const pulito = numeroPulito(numero)
  return pulito.replace('+', '').length >= 6 ? `tel:${pulito}` : null
}

/** Link WhatsApp (wa.me vuole il numero internazionale senza "+" né "00"). */
export function whatsappHref(numero: string | undefined | null): string | null {
  const cifre = numeroPulito(numero).replace(/^\+/, '').replace(/^00/, '')
  return cifre.length >= 8 ? `https://wa.me/${cifre}` : null
}

/** Numero del centro da usare nei link: E.164 se compilato, altrimenti quello visibile. */
export function telefonoCentro(site: { telefonoE164?: string; telefono?: string }): string {
  return numeroPulito(site.telefonoE164 || site.telefono)
}
