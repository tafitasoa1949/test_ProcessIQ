import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { logger } from './utils/logger'
import documentRoutes from './routes/documents'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
     res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
     })
})

app.use('/api/documents', documentRoutes)

const connectDB = async () => {
     try {
          const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/processiq'
          await mongoose.connect(uri)
          logger.info('MongoDB connecté')
     } catch (error) {
          logger.error('Erreur connexion MongoDB', error)
          process.exit(1)
     }
}

connectDB().then(() => {
     app.listen(PORT, () => {
          logger.info(`Serveur démarré sur le port ${PORT}`)
     })
})

export default app