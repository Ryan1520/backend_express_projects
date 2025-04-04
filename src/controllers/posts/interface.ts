export interface PostsRequestParamsI {
  page: number;
  size: number;
}

export interface CreatePostRequestBodyI {
  title: string;
  content: string;
  author: string;
}

export interface UpdatePostRequestBodyI {
  title?: string;
  content?: string;
  author?: string;
}

export interface PostRawDataI {
  id: number;
  title: string;
  post_text: string;
  user_name: string;
  date_posted: string;
  create_time: string;
}
