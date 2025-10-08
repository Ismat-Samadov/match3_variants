import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = `cvs/${Date.now()}-${fileName}`

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  )

  // Return public URL
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

export async function getSignedDownloadUrl(fileUrl: string): Promise<string> {
  // Extract key from URL
  const key = fileUrl.replace(`${process.env.R2_PUBLIC_URL}/`, '')

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })

  // Generate signed URL valid for 1 hour
  return await getSignedUrl(r2Client, command, { expiresIn: 3600 })
}
