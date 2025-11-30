/**
 * Service Cloudinary pour l'upload d'images
 * Utilise l'API Upload de Cloudinary avec upload non signé
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dhzibf7tu'
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'eventlink'

export interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
  created_at: string
}

/**
 * Upload une image vers Cloudinary (upload non signé)
 * Note: Un preset unsigned doit être configuré dans Cloudinary Dashboard
 * @param file - Le fichier image à uploader
 * @param folder - Dossier optionnel dans Cloudinary (par défaut: 'categories')
 * @returns L'URL sécurisée de l'image uploadée
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'categories'
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  
  // Upload non signé - nécessite un preset unsigned configuré dans Cloudinary
  // Le preset doit être configuré dans Settings > Upload > Upload presets
  // avec "Signing mode" = "Unsigned"

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur lors de l\'upload de l\'image')
    }

    const data: CloudinaryUploadResponse = await response.json()
    return data.secure_url
  } catch (error: any) {
    console.error('Erreur Cloudinary:', error)
    throw new Error(error.message || 'Erreur lors de l\'upload de l\'image vers Cloudinary')
  }
}

/**
 * Génère une URL Cloudinary avec transformations
 * @param imageUrl - L'URL de l'image Cloudinary
 * @param width - Largeur optionnelle
 * @param height - Hauteur optionnelle
 * @param crop - Mode de recadrage optionnel
 * @returns L'URL transformée
 */
export function getCloudinaryImageUrl(
  imageUrl: string,
  width?: number,
  height?: number,
  crop: string = 'fill'
): string {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl
  }

  const url = new URL(imageUrl)
  const pathParts = url.pathname.split('/')
  const versionIndex = pathParts.findIndex((part) => /^v\d+$/.test(part))
  
  if (versionIndex === -1) {
    return imageUrl
  }

  const publicId = pathParts.slice(versionIndex + 1).join('/').replace(/\.[^.]+$/, '')
  
  let transformations = []
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (crop) transformations.push(`c_${crop}`)
  
  const transformString = transformations.length > 0 ? transformations.join(',') + '/' : ''
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}v${pathParts[versionIndex].replace('v', '')}/${publicId}${url.pathname.match(/\.[^.]+$/)?.[0] || '.jpg'}`
}

