import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.post('/generate', async (req: AuthRequest, res: Response) => {
     try {
          const { type, userId } = req.body

          if (!type || !userId) {
               res.status(400).json({ error: 'type et userId sont requis' })
               return
          }

          if (!['cerfa', 'convention'].includes(type)) {
               res.status(400).json({ error: 'type doit être cerfa ou convention' })
               return
          }

          res.status(200).json({
               message: 'Endpoint opérationnel',
               type,
               userId
          })
     } catch (error) {
          res.status(500).json({ error: 'Erreur serveur' })
     }
})

router.get('/', async (req: AuthRequest, res: Response) => {
     try {
          res.status(200).json({ documents: [] })
     } catch (error) {
          res.status(500).json({ error: 'Erreur serveur' })
     }
})

export default router