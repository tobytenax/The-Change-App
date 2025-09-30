import { ChangeApp } from './core/ChangeApp.js'
import { createAPIServer } from './api/server.js'

/**
 * Main entry point for The Change App
 */
async function main() {
  console.log('🌟 Starting The Change App - Revolutionary Living Democracy Platform')
  console.log('📜 Founded on the Digital Bill of Rights')
  console.log('⚖️ Governed by the Change App Democratic License (CADL)')
  
  try {
    // Initialize the core Change App
    const app = new ChangeApp({
      // Using memory storage for development
    })
    
    await app.initialize()
    
    // Start the API server
    const server = await createAPIServer(app)
    const port = process.env.PORT || 3001
    
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 The Change App API server running on port ${port}`)
      console.log(`📡 P2P networking active`)
      console.log(`🗳️ Ready for democratic participation!`)
    })
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down The Change App...')
      await app.close()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('💥 Failed to start The Change App:', error)
    process.exit(1)
  }
}

// Start the application
main().catch(console.error)

