import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger'

export interface AuthRequest extends Request {
     userId?: string
}

export const authMiddleware = (
     req: AuthRequest,
     res: Response,
     next: NextFunction
): void => {
     try {
          const authHeader = req.headers.authorization

          if (!authHeader || !authHeader.startsWith('Bearer ')) {
               res.status(401).json({ error: 'Token manquant ou invalide' })
               return
          }

          const token = authHeader.split(' ')[1]
          const secret = process.env.JWT_SECRET || 'default_secret'
          const decoded = jwt.verify(token, secret) as { userId: string }

          req.userId = decoded.userId
          next()
     } catch (error) {
          logger.warn('Tentative d\'accès avec token invalide')
          res.status(401).json({ error: 'Token invalide ou expiré' })
     }
}

export const generateToken = (userId: string): string => {
     const secret = process.env.JWT_SECRET || 'default_secret'
     return jwt.sign({ userId }, secret, { expiresIn: '24h' })
}