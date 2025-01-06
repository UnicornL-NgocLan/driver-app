import jwt from 'jsonwebtoken'

export const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);