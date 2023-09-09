import { ObjectId } from "mongodb"

enum UserVerifyStatus {
    Unverified, // Chưa xác thực email
    Verified, // Đã xác thực Email
    Banner // Khóa mõm
}
interface UserType {
    _id?: ObjectId
    name?: string
    email: string
    date_of_birth: Date
    password: string
    created_at?: Date
    updated_at?: Date
    email_verify_token?: string // Jwt or null
    // Xác thực email khi đăng ký
    fogot_password_token?: string // Jwt or null
    // Đổi lại mật khẩu
    verify?: UserVerifyStatus

    bio?: string
    location?: string
    website?: string
    username?: string
    avatar?: string
    cover_photo?: string
}

export default class User {
    _id?: ObjectId
    name: string
    email: string
    date_of_birth: Date
    password: string
    created_at: Date
    updated_at: Date
    email_verify_token: string // Jwt or null
    // Xác thực email khi đăng ký
    fogot_password_token: string // Jwt or null
    // Đổi lại mật khẩu
    verify: UserVerifyStatus

    bio: string
    location: string
    website: string
    username: string
    avatar: string
    cover_photo: string
    constructor(user: UserType) {
        this._id = user._id
        this.name = user.name || ''
        this.email = user.email
        this.date_of_birth = user.date_of_birth || new Date()
        this.password = user.password
        this.created_at = user.created_at || new Date()
        this.updated_at = user.updated_at || new Date()
        this.email_verify_token = user.email_verify_token || ''
        this.fogot_password_token = user.fogot_password_token || ''
        this.verify = user.verify || UserVerifyStatus.Unverified
        this.bio = user.bio || ''
        this.location = user.location || ''
        this.website = user.website || ''
        this.username = user.username || ''
        this.avatar = user.avatar || ''
        this.cover_photo = user.cover_photo || ''
    }
}