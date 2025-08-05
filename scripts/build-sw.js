const fs = require('fs')
const path = require('path')

const swPath = path.join(process.cwd(), 'public', 'sw.js')
const swContent = fs.readFileSync(swPath, 'utf8')

const envVars = {
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let updatedContent = swContent

Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    updatedContent = updatedContent.replace(
      new RegExp(`'${key}'`, 'g'),
      `'${value}'`,
    )
  }
})

fs.writeFileSync(swPath, updatedContent)
console.log('Service worker updated with environment variables')
