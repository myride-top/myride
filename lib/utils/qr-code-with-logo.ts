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

    // Helper function to load an image
    const loadImage = async (
      imageUrl: string,
      useCors: boolean = false
    ): Promise<HTMLImageElement | null> => {
      try {
        const img = new Image()
        if (useCors) {
          img.crossOrigin = 'anonymous'
        }

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = imageUrl
        })

        if (img.complete && img.naturalWidth > 0) {
          return img
        }
      } catch (error) {
        console.log(error)
        return null
      }
      return null
    }

    // Helper function to draw a circular logo on canvas
    const drawCircularLogo = (
      img: HTMLImageElement,
      x: number,
      y: number,
      size: number
    ) => {
      ctx.save()

      // Draw white background circle
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()

      // Create circular clipping path
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI)
      ctx.clip()

      // Draw image
      ctx.drawImage(img, x, y, size, size)
      ctx.restore()
    }

    // Try to load both avatar and MyRide logo
    const defaultLogo = '/icon.jpg'
    let avatarImage: HTMLImageElement | null = null
    let myrideLogoImage: HTMLImageElement | null = null

    // Load avatar if provided and not the default logo
    if (logoUrl && logoUrl !== defaultLogo) {
      const isExternal =
        !logoUrl.startsWith('/') &&
        !logoUrl.startsWith('data:') &&
        !logoUrl.startsWith(window.location.origin)
      avatarImage = await loadImage(logoUrl, isExternal)
    }

    // Always try to load MyRide logo
    myrideLogoImage = await loadImage(defaultLogo, false)

    // Draw both logos if available
    if (avatarImage && myrideLogoImage) {
      // Both logos: MyRide logo on top (bigger), avatar below (smaller)
      const myrideSize = logoSize
      const avatarSize = logoSize * 0.5 // Smaller avatar
      const spacing = 8 // Space between logos
      const totalHeight = myrideSize + spacing + avatarSize
      const startY = (width - totalHeight) / 2
      const centerX = (width - myrideSize) / 2

      // Draw MyRide logo (top, bigger)
      drawCircularLogo(myrideLogoImage, centerX, startY, myrideSize)

      // Draw avatar (bottom, smaller, centered)
      const avatarX = (width - avatarSize) / 2
      const avatarY = startY + myrideSize + spacing
      drawCircularLogo(avatarImage, avatarX, avatarY, avatarSize)
    } else if (avatarImage) {
      // Only avatar: center it
      const logoX = (width - logoSize) / 2
      const logoY = (width - logoSize) / 2
      drawCircularLogo(avatarImage, logoX, logoY, logoSize)
    } else if (myrideLogoImage) {
      // Only MyRide logo: center it
      const logoX = (width - logoSize) / 2
      const logoY = (width - logoSize) / 2
      drawCircularLogo(myrideLogoImage, logoX, logoY, logoSize)
    }

    // Return the combined image as data URL
    // Wrap in try-catch in case canvas is still tainted
    try {
      return canvas.toDataURL('image/png')
    } catch (exportError) {
      // If canvas export fails (tainted), try to regenerate with just MyRide logo
      console.warn(
        'Canvas export failed, regenerating with MyRide logo:',
        exportError
      )
      try {
        // Regenerate QR code and add only MyRide logo (which should work since it's local)
        const fallbackQrCode = await QRCode.toDataURL(text, {
          width,
          margin,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        })

        const fallbackCanvas = document.createElement('canvas')
        const fallbackCtx = fallbackCanvas.getContext('2d')
        if (!fallbackCtx) throw new Error('Could not get canvas context')

        fallbackCanvas.width = width
        fallbackCanvas.height = width

        const fallbackQrImage = new Image()
        await new Promise((resolve, reject) => {
          fallbackQrImage.onload = resolve
          fallbackQrImage.onerror = reject
          fallbackQrImage.src = fallbackQrCode
        })

        fallbackCtx.drawImage(fallbackQrImage, 0, 0, width, width)

        // Helper function to draw circular logo on fallback canvas
        const drawFallbackLogo = (
          img: HTMLImageElement,
          x: number,
          y: number,
          size: number
        ) => {
          fallbackCtx.save()
          fallbackCtx.beginPath()
          fallbackCtx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI)
          fallbackCtx.fillStyle = '#FFFFFF'
          fallbackCtx.fill()
          fallbackCtx.beginPath()
          fallbackCtx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI)
          fallbackCtx.clip()
          fallbackCtx.drawImage(img, x, y, size, size)
          fallbackCtx.restore()
        }

        // Try to load both avatar and MyRide logo for fallback
        let fallbackAvatar: HTMLImageElement | null = null
        let fallbackMyride: HTMLImageElement | null = null

        if (logoUrl && logoUrl !== defaultLogo) {
          const isExternal =
            !logoUrl.startsWith('/') &&
            !logoUrl.startsWith('data:') &&
            !logoUrl.startsWith(window.location.origin)
          try {
            const img = new Image()
            if (isExternal) {
              img.crossOrigin = 'anonymous'
            }
            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
              img.src = logoUrl
            })
            if (img.complete && img.naturalWidth > 0) {
              fallbackAvatar = img
            }
          } catch {}
        }

        // Load MyRide logo
        try {
          const myrideImg = new Image()
          await new Promise((resolve, reject) => {
            myrideImg.onload = resolve
            myrideImg.onerror = reject
            myrideImg.src = defaultLogo
          })
          if (myrideImg.complete && myrideImg.naturalWidth > 0) {
            fallbackMyride = myrideImg
          }
        } catch {}

        // Draw both logos if available
        if (fallbackAvatar && fallbackMyride) {
          const myrideSize = logoSize
          const avatarSize = logoSize * 0.5
          const spacing = 8
          const totalHeight = myrideSize + spacing + avatarSize
          const startY = (width - totalHeight) / 2
          const centerX = (width - myrideSize) / 2
          drawFallbackLogo(fallbackMyride, centerX, startY, myrideSize)
          const avatarX = (width - avatarSize) / 2
          const avatarY = startY + myrideSize + spacing
          drawFallbackLogo(fallbackAvatar, avatarX, avatarY, avatarSize)
        } else if (fallbackMyride) {
          // Only MyRide logo
          const logoX = (width - logoSize) / 2
          const logoY = (width - logoSize) / 2
          drawFallbackLogo(fallbackMyride, logoX, logoY, logoSize)
        }

        return fallbackCanvas.toDataURL('image/png')
      } catch (fallbackError) {
        // Last resort: return QR code without logo
        console.warn(
          'Fallback also failed, returning QR code without logo:',
          fallbackError
        )
        return qrCodeDataUrl
      }
    }
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
