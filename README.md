# Chat Application với Supabase và Next.js

Ứng dụng chat real-time sử dụng Next.js, Supabase và TypeScript.

## Cài đặt

1. **Clone và cài đặt dependencies:**
```bash
npm install
```

2. **Cấu hình Environment Variables:**
Tạo file `.env.local` với nội dung:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Thiết lập Database:**
- Đăng nhập vào Supabase Dashboard
- Vào tab SQL Editor
- Copy và chạy nội dung file `scripts/setup-database.sql`
- Đảm bảo Realtime đã được bật cho bảng `messages` trong Settings > API

4. **Cấu hình Authentication:**
- Vào Authentication > Settings trong Supabase Dashboard
- Thêm URL redirect: `http://localhost:3000/auth/callback`
- Bật các providers bạn muốn sử dụng (Google, GitHub, etc.)

## Chạy ứng dụng

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Tính năng

- ✅ **Real-time messaging** - Tin nhắn được cập nhật tức thì
- ✅ **User authentication** - Đăng nhập bằng Supabase Auth
- ✅ **Online presence** - Hiển thị số người đang online
- ✅ **Responsive design** - Hoạt động trên mọi thiết bị
- ✅ **API Routes** - Sử dụng Next.js App Router API

## Cấu trúc thư mục

```
src/
├── app/
│   ├── api/messages/          # API routes cho messages
│   ├── auth/callback/         # Auth callback
│   └── page.tsx              # Trang chính
├── components/
│   ├── ChatHeader.tsx        # Header với thông tin user
│   ├── ChatInput.tsx         # Input để gửi tin nhắn
│   ├── ChatMessage.tsx       # Component hiển thị tin nhắn
│   ├── ChatMessages.tsx      # Danh sách tin nhắn
│   ├── ChatPresence.tsx      # Hiển thị số người online
│   └── ChatAbout.tsx         # Trang giới thiệu
├── hooks/
│   └── useUser.ts           # Hook quản lý user state
├── lib/
│   ├── supabase/            # Cấu hình Supabase
│   └── types/               # TypeScript types
└── scripts/
    └── setup-database.sql   # Script thiết lập database
```

## API Routes

### GET /api/messages
Lấy danh sách tin nhắn với thông tin user.

### POST /api/messages
Gửi tin nhắn mới. Requires authentication.

Body:
```json
{
  "text": "Nội dung tin nhắn"
}
```

## Troubleshooting

### Tin nhắn không gửi được:
1. Kiểm tra console để xem lỗi cụ thể
2. Đảm bảo đã chạy script SQL setup
3. Kiểm tra environment variables
4. Đảm bảo user đã đăng nhập

### Realtime không hoạt động:
1. Kiểm tra Realtime đã được bật trong Supabase Dashboard
2. Đảm bảo bảng `messages` đã được thêm vào publication `supabase_realtime`
3. Kiểm tra RLS policies đã được thiết lập đúng

### User không được lưu vào database:
1. Kiểm tra RLS policies cho bảng `users`
2. Đảm bảo `auth.uid()` trả về đúng user ID
3. Kiểm tra foreign key constraints

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Deployment:** Vercel (recommended)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
