if (!process.env.VITE_USERPOOL_ID) {
  console.error('VITE_USERPOOL_ID is not set')
  process.exit(1)
}