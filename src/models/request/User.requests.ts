export interface RegisterRequestBody {
    name: string,
    email: string,
    password: string,
    confirm_password: string
    date_of_birth: string
}

export interface LogoutReqBody {
    refreshToken: string
}

export interface ForgotPasswordReqBody {
    email: string
}

export interface UpdateUserRequestBody {
    name: string,
    date_of_birth: Date,
    bio: string,
    location: string,
    website: string,
    username: string,
    avatar: string,
    cover_photo: string,
    refreshToken: string
}