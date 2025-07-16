# UniShorts: Technical and Functional Documentation
# UniShorts: التوثيق الفني والوظيفي

## 1. Introduction (مقدمة)

UniShorts is a web platform designed for university students to showcase their short films. It provides a space for filmmakers to gain exposure, receive feedback, and connect with a community of peers and academics. This document provides a detailed overview of the platform's architecture, features, and data model.

UniShorts هي منصة ويب مصممة لطلاب الجامعات لعرض أفلامهم القصيرة. توفر مساحة لصانعي الأفلام للحصول على الانتشار وتلقي الملاحظات والتواصل مع مجتمع من الأقران والأكاديميين. يقدم هذا المستند نظرة عامة مفصلة على بنية المنصة وميزاتها ونموذج البيانات الخاص بها.

---

## 2. System Architecture (الهيكل العام للنظام)

The platform is built on a modern Jamstack architecture, separating the frontend from the backend services.

تعتمد المنصة على بنية Jamstack الحديثة، حيث يتم فصل الواجهة الأمامية عن خدمات الواجهة الخلفية.

### High-Level Diagram (مخطط عالي المستوى)

```
+----------------------+      +--------------------------------+
|      User/Browser    |      |         Frontend (Vite)        |
| (المستخدم/المتصفح)  |----->|         [React + TS]           |
+----------------------+      +--------------------------------+
                                |
                                | (API Calls / استدعاءات)
                                V
+--------------------------------------------------------------------------+
|                            Backend (Supabase)                            |
|                          (الواجهة الخلفية - سوبابيس)                      |
|--------------------------------------------------------------------------|
| [Authentication] | [Database: PostgreSQL] | [Storage] | [Edge Functions] |
| (المصادقة)       | (قاعدة البيانات)       | (التخزين) | (وظائف الخادم)   |
+--------------------------------------------------------------------------+
   |          |
   |          V
   |      +------------------+
   |      | External Services|
   |      | (خدمات خارجية)   |
   |      |------------------|
   |      | - Resend (Email) |
   |      | - DeepSeek (AI)  |
   |      +------------------+
   V
+----------------------+
|   Admin/Moderator    |
| (المشرف/المدير)      |
+----------------------+
```

### Components (المكونات)

*   **Frontend (الواجهة الأمامية)**: A single-page application (SPA) built with **React** and **TypeScript**. It is responsible for rendering the user interface and interacting with the backend.
*   **Backend (الواجهة الخلفية)**: Powered entirely by **Supabase**, which provides:
    *   **Authentication**: Manages user sign-up, login, and sessions.
    *   **Database**: A PostgreSQL database for storing all application data.
    *   **Storage**: For hosting user-uploaded files like videos and thumbnails.
    *   **Edge Functions**: Serverless functions for custom logic like AI integration, email sending, and complex database operations.
*   **External Services (خدمات خارجية)**:
    *   **Resend**: Used for sending transactional emails (e.g., welcome emails, support ticket confirmations).
    *   **DeepSeek**: An AI service used to generate relevant keywords for films based on their title and description.

---

## 3. Frontend Architecture (هيكل الواجهة الأمامية)

### Tech Stack (التقنيات المستخدمة)

*   **Framework**: React 18
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS with shadcn/ui component library
*   **Routing**: React Router
*   **Data Fetching/State**: TanStack Query (React Query) for server state management and React Context API for global UI state.

### Directory Structure (هيكل المجلدات)

```
src/
├── App.tsx               # Main application component with routing setup
├── main.tsx              # Application entry point
├── globals.css           # Global styles and Tailwind directives
├── components/           # Reusable UI components (e.g., Button, Card, Header)
│   ├── admin/            # Components specific to the admin dashboard
│   ├── dashboard/        # Components for the user dashboard
│   └── ui/               # Base components from shadcn/ui
├── pages/                # Route components (e.g., Home, Login, FilmPage)
│   └── admin/            # Pages for the admin dashboard
├── hooks/                # Custom React hooks (e.g., useAuth, useDebounce)
├── lib/                  # Utility functions (e.g., cn for classnames)
├── integrations/         # Integration clients (e.g., Supabase client)
├── types/                # TypeScript type definitions
└── utils/                # General utility functions (e.g., toast notifications)
```

---

## 4. Backend & Database Schema (الواجهة الخلفية وهيكل قاعدة البيانات)

The backend is managed by Supabase. All data is stored in a PostgreSQL database. Below is the schema for the main tables.

تتم إدارة الواجهة الخلفية بواسطة Supabase. يتم تخزين جميع البيانات في قاعدة بيانات PostgreSQL. فيما يلي مخطط الجداول الرئيسية.

### `profiles` (ملفات المستخدمين)
Stores user account information. Linked to `auth.users` by a one-to-one relationship.
<details>
  <summary>Click to view schema</summary>

| Column (الحقل) | Type (النوع) | Description (الوصف) |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, references `auth.users.id`. المفتاح الأساسي. |
| `username` | `text` | Unique public username. اسم مستخدم فريد. |
| `first_name` | `text` | User's first name. الاسم الأول. |
| `last_name` | `text` | User's last name. اسم العائلة. |
| `avatar_url` | `text` | URL to profile picture. رابط الصورة الشخصية. |
| `university_email` | `text` | Verified university email. البريد الإلكتروني الجامعي. |
| `institution_name` | `text` | Name of the university. اسم الجامعة. |
| `role` | `text` | User role (`user`, `moderator`, `admin`). دور المستخدم. |
| `account_status` | `text` | Account status (`active`, `pending_admin_approval`, `rejected`). حالة الحساب. |
| `created_at` | `timestampz` | Timestamp of creation. تاريخ الإنشاء. |
</details>

### `films` (الأفلام)
Stores all information related to a film submission.
<details>
  <summary>Click to view schema</summary>

| Column (الحقل) | Type (النوع) | Description (الوصف) |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key. المفتاح الأساسي. |
| `user_id` | `uuid` | Foreign Key to `profiles.id`. مفتاح خارجي لجدول المستخدمين. |
| `title` | `text` | Title of the film. عنوان الفيلم. |
| `description` | `text` | Synopsis of the film. ملخص الفيلم. |
| `thumbnail_url` | `text` | URL to the film's thumbnail image. رابط الصورة المصغرة. |
| `video_url` | `text` | URL to the film's video file. رابط ملف الفيديو. |
| `status` | `text` | Submission status (`draft`, `in_review`, `published`, `rejected`). حالة الفيلم. |
| `visibility` | `text` | Privacy setting (`public`, `private`, `unlisted`). إعداد الخصوصية. |
| `view_count` | `integer` | Total number of views. عدد المشاهدات. |
| `created_at` | `timestampz` | Timestamp of creation. تاريخ الإنشاء. |
</details>

### `comments` (التعليقات)
Stores comments made by users on films.
<details>
  <summary>Click to view schema</summary>

| Column (الحقل) | Type (النوع) | Description (الوصف) |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key. المفتاح الأساسي. |
| `user_id` | `uuid` | Foreign Key to `profiles.id`. مفتاح خارجي لجدول المستخدمين. |
| `film_id` | `uuid` | Foreign Key to `films.id`. مفتاح خارجي لجدول الأفلام. |
| `content` | `text` | The text of the comment. نص التعليق. |
| `parent_comment_id` | `uuid` | Foreign Key to `comments.id` for replies. مفتاح خارجي للردود. |
| `created_at` | `timestampz` | Timestamp of creation. تاريخ الإنشاء. |
</details>

### Other Key Tables (جداول رئيسية أخرى)

*   **`likes`**: Tracks which user liked which film. (user_id, film_id)
*   **`favorites`**: Tracks which user added which film to their favorites. (user_id, film_id)
*   **`notifications`**: Stores notifications for users (e.g., new comment, film approved).
*   **`platform_settings`**: A single-row table to store global configuration for the admin panel.
*   **`institutions`**: Stores a list of approved universities and their email domains for registration validation.
*   **`system_logs`**: An audit log for important system and user actions.
*   **`support_tickets`**: Stores messages from users sent via the "Contact Support" page.

---

## 5. Key Features & Data Flow (الميزات الرئيسية وتدفق البيانات)

### User Registration Flow (تدفق تسجيل المستخدم)

```
1. User fills out sign-up form with university email.
   (المستخدم يملأ نموذج التسجيل ببريده الجامعي)
   |
   V
2. Frontend calls `custom-signup` Edge Function.
   (الواجهة الأمامية تستدعي وظيفة الخادم)
   |
   V
3. Edge Function validates:
   - Is email from an approved university domain (checks `institutions` table)?
   - Is username unique?
   (وظيفة الخادم تتحقق من صحة النطاق وتفرد اسم المستخدم)
   |
   V
4. If valid, creates user in `auth.users` and a corresponding record in `profiles` with `account_status = 'pending_admin_approval'`.
   (إذا كان صالحًا، يتم إنشاء حساب وحالة الحساب تكون "قيد موافقة المشرف")
   |
   V
5. User is redirected to a "Pending Approval" page.
   (يتم توجيه المستخدم إلى صفحة الانتظار)
   |
   V
6. Admin reviews and approves the user from the admin dashboard. `account_status` becomes `active`.
   (المشرف يوافق على الحساب، وتتغير حالته إلى "نشط")
   |
   V
7. User receives a welcome email and can now log in and use the platform.
   (المستخدم يتلقى بريدًا ترحيبيًا ويمكنه الآن استخدام المنصة)
```

### Film Upload & Review Flow (تدفق رفع ومراجعة الأفلام)

```
1. User fills out the "Upload Film" form, providing metadata and files.
   (المستخدم يملأ نموذج رفع الفيلم)
   |
   V
2. Frontend uploads video and thumbnail files to Supabase Storage.
   (الواجهة الأمامية ترفع الملفات إلى Supabase Storage)
   |
   V
3. After successful upload, frontend creates a new record in the `films` table with `status = 'in_review'`.
   (بعد الرفع، يتم إنشاء سجل جديد في جدول الأفلام بحالة "قيد المراجعة")
   |
   V
4. Admins/Moderators see the film in their review queue in the admin dashboard.
   (المشرفون يرون الفيلم في قائمة المراجعة)
   |
   V
5. Admin can:
   - Approve: `status` becomes `published`. Film is now visible on the site.
   - Reject: `status` becomes `rejected`. Admin provides a reason.
   (المشرف يمكنه الموافقة أو الرفض)
   |
   V
6. User is notified of the decision via an in-app notification and an email.
   (يتم إعلام المستخدم بالقرار عبر إشعار وبريد إلكتروني)
```

### AI Keyword Generation (إنشاء الكلمات المفتاحية بالذكاء الاصطناعي)

When a user is uploading or editing a film, they can use an AI-powered feature to suggest relevant tags.

عندما يقوم المستخدم برفع فيلم أو تعديله، يمكنه استخدام ميزة مدعومة بالذكاء الاصطناعي لاقتراح علامات (tags) ذات صلة.

```
1. User clicks "Suggest Keywords with AI" button on the film form.
   (المستخدم يضغط على زر "اقترح كلمات مفتاحية بالذكاء الاصطناعي")
   |
   V
2. Frontend calls the `generate-keywords` Edge Function, sending the film's title and description.
   (الواجهة الأمامية تستدعي وظيفة الخادم وترسل عنوان الفيلم ووصفه)
   |
   V
3. Edge Function sends a formatted prompt to the DeepSeek AI API.
   (وظيفة الخادم ترسل طلبًا إلى واجهة برمجة تطبيقات DeepSeek AI)
   |
   V
4. DeepSeek AI returns a JSON array of suggested keywords.
   (DeepSeek AI يعيد قائمة بالكلمات المفتاحية المقترحة)
   |
   V
5. The keywords are displayed to the user, who can click to add them to the film's tags.
   (تُعرض الكلمات المفتاحية للمستخدم، الذي يمكنه إضافتها إلى الفيلم)