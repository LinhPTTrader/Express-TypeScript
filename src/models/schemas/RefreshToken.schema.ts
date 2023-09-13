
import { ObjectId } from "mongodb"

interface RefreshTokenType {
  _id?: ObjectId
  refreshToken: string
  created_at?: Date
  user_id: ObjectId // UserID
}


export class RefreshToken {
  _id?: ObjectId
  refreshToken: string
  created_at: Date
  user_id: ObjectId // UserID
  constructor(token: RefreshTokenType) {
    this._id = token._id
    this.refreshToken = token.refreshToken
    this.created_at = token.created_at || new Date()
    this.user_id = token.user_id
  }
}