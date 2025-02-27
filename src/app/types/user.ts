export interface User {
  id: string;
  subject_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  id: string;
}

export interface UpdateUserRequest {
  subject_id: string;
}
