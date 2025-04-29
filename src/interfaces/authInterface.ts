export interface RegisterRequestI {
  email: string
  password: string
}

export interface UserResponseI {
  id: number
  email: string
  password: string
  created_at: Date
  refresh_token: string
}