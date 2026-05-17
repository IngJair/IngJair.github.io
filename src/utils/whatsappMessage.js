/**
 * Genera el link de WhatsApp con el mensaje del paquete
 * reemplazando las variables del template.
 */
export function buildWhatsappLink({ template, paquete, seccion, descripcion, precio, negocio, whatsappNumber }) {

  const descFormatted = Array.isArray(descripcion)
    ? descripcion.map(d => `• ${d}`).join('\n')
    : descripcion || ''

  const message = template
    .replace(/{{paquete}}/g, paquete || '')
    .replace(/{{seccion}}/g, seccion || '')
    .replace(/{{descripcion}}/g, descFormatted)
    .replace(/{{precio}}/g, precio || '')
    .replace(/{{negocio}}/g, negocio || '')

  const number = (whatsappNumber || '').replace(/[^0-9]/g, '')

  // Codificación correcta para WhatsApp preservando emojis
  const encoded = encodeURIComponent(message)

  return `https://wa.me/${number}?text=${encoded}`
}
