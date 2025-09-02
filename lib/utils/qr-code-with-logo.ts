import QRCode from 'qrcode'

export async function generateQRCodeWithLogo(
  text: string,
  logoUrl: string,
  options: {
    width?: number
    margin?: number
    logoSize?: number
    logoCornerRadius?: number
  } = {}
): Promise<string> {
  const { width = 300, margin = 2, logoSize = 60 } = options

  try {
    // Generate base QR code
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width,
      margin,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction for logo overlay
    })

    // Create canvas to combine QR code and logo
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    canvas.width = width
    canvas.height = width

    // Load QR code image
    const qrImage = new Image()
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve
      qrImage.onerror = reject
      qrImage.src = qrCodeDataUrl
    })

    // Draw QR code on canvas
    ctx.drawImage(qrImage, 0, 0, width, width)

    // Load logo image
    const logoImage = new Image()
    await new Promise((resolve, reject) => {
      logoImage.onload = resolve
      logoImage.onerror = reject
      logoImage.src = logoUrl
    })

    // Calculate logo position (center)
    const logoX = (width - logoSize) / 2
    const logoY = (width - logoSize) / 2

    // Create rounded rectangle path for logo with white background
    ctx.save()

    // Draw white background circle for logo
    ctx.beginPath()
    ctx.arc(
      logoX + logoSize / 2,
      logoY + logoSize / 2,
      logoSize / 2,
      0,
      2 * Math.PI
    )
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()

    // Create circular clipping path
    ctx.beginPath()
    ctx.arc(
      logoX + logoSize / 2,
      logoY + logoSize / 2,
      logoSize / 2,
      0,
      2 * Math.PI
    )
    ctx.clip()

    // Draw logo
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
    ctx.restore()

    // Return the combined image as data URL
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating QR code with logo:', error)
    // Fallback to regular QR code if logo embedding fails
    return QRCode.toDataURL(text, {
      width,
      margin,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  }
}
