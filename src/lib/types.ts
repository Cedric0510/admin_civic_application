export type Article = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published_at: string;
};

export type Poll = {
  id: string;
  question: string;
  is_active: boolean;
  created_at: string;
  poll_options?: PollOption[];
};

export type PollOption = {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
};

export type Appointment = {
  id: string;
  name: string;
  email: string;
  service: string;
  date: string;
  message: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  phone: string | null;
  address: string | null;
  hours: string | null;
};

export type CitySettings = {
  id: number;
  village_name: string;
};
