export type Profile = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  short_bio: string | null;
  avatar_url: string | null;
  created_at: string;
  university_email: string | null;
  institution_name: string | null;
  phone_number: string | null;
  role: 'user' | 'admin' | 'moderator' | 'reviewer';
  account_status?: 'active' | 'disabled' | 'banned' | 'pending_email_verification' | 'pending_admin_approval' | 'rejected';
};

export type Film = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  view_count: number;
  visibility: 'public' | 'private' | 'unlisted';
  created_at: string;
  status: 'published' | 'in_review' | 'rejected' | 'draft';
  language: string | null;
  genre: string | null;
  duration_minutes: number | null;
  tags: string | null;
  director_names: string | null;
  institution: string | null;
  release_date: string | null;
  production_year: number | null;
  filming_country: string | null;
  trailer_url: string | null;
  subtitles: string[] | null;
  submission_notes: string | null;
  rejection_reason: string | null;
};

export type Comment = {
  id: string;
  user_id: string;
  film_id: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
};

export type CommentWithProfile = {
    id: string;
    user_id: string;
    film_id: string;
    content: string;
    created_at: string;
    parent_comment_id: string | null;
    profiles: Profile | null;
};

export type NotificationType = 
  | 'film_approved'
  | 'film_rejected'
  | 'new_comment'
  | 'comment_reply'
  | 'new_submission'
  | 'milestone'
  | 'platform_update'
  | 'account_approved'
  | 'account_rejected';

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  url: string | null;
  read_status: boolean;
  created_at: string;
  related_entity_id: string | null;
};

export type PlatformSettings = {
  id: number;
  logo_url: string | null;
  primary_color: string | null;
  privacy_policy: string | null;
  terms_of_use: string | null;
  contact_email: string | null;
  welcome_message: string | null;
  film_rejection_template: string | null;
  updated_at: string;
  platform_name: string | null;
  platform_description: string | null;
  default_language: string | null;
  timezone: string | null;
  maintenance_mode: boolean | null;
  maintenance_message: string | null;
  favicon_url: string | null;
  secondary_color: string | null;
  background_color: string | null;
  theme_mode: string | null;
  footer_copyright: string | null;
  enable_2fa: boolean | null;
  failed_login_limit: number | null;
  manual_user_approval: boolean | null;
  manual_film_review: boolean | null;
};

export type AdminUser = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  university_email: string | null;
  institution_name: string | null;
  role: string | null;
  account_status: 'active' | 'disabled' | 'banned' | 'pending_email_verification' | 'pending_admin_approval' | 'rejected' | null;
  last_sign_in_at: string | null;
  avatar_url: string | null;
  film_count: number | null;
  total_views: number | null;
  username: string | null;
  field_of_study: string | null;
  short_bio: string | null;
  phone_number: string | null;
  created_at: string;
};

export type SystemLog = {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  details: Record<string, any> | null;
  ip_address: string | null;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  updated_at: string;
  is_enabled: boolean;
};

export type Institution = {
  id: string;
  name: string;
  approved_domains: string[] | null;
  created_at: string;
};

export type Permission = {
  id: number;
  action: string;
  description: string | null;
};

export type RolePermission = {
  id: number;
  role: string;
  permission_id: number;
};