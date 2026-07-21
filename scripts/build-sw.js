const fs = require('fs')
const path = require('path')

const publicDir = path.join(process.cwd(), 'public')
const templatePath = path.join(publicDir, 'sw.template.js')
const swPath = path.join(publicDir, 'sw.js')
const swTemplate = fs.readFileSync(templatePath, 'utf8')

const replacements = {
  __FIREBASE_API_KEY__: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  __FIREBASE_AUTH_DOMAIN__: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  __FIREBASE_PROJECT_ID__: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  __FIREBASE_STORAGE_BUCKET__:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  __FIREBASE_MESSAGING_SENDER_ID__:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  __FIREBASE_APP_ID__: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
}

const swContent = Object.entries(replacements).reduce(
  (content, [placeholder, value]) =>
    content.replaceAll(placeholder, value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")),
  swTemplate,
)

fs.writeFileSync(swPath, swContent)
console.log('Service worker generated from template')
