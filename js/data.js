/*
 * ===================================================================
 *  DỮ LIỆU CỦA TEAM — chỉ cần sửa file này là đủ.
 * ===================================================================
 *  - id:       dùng trên URL (member.html#...), viết liền, không dấu
 *  - color:    màu "chủ đạo" của từng người (glow khi hover, điểm nhấn trang cá nhân)
 *  - ảnh:      bỏ ảnh gốc vào photos/<id>.jpg, script sẽ tự tách nền ra images/members/<id>.webp.
 *              (Muốn dùng ảnh khác thì thêm trường photo: "đường/dẫn/ảnh")
 *  - projects: những thứ đã làm được; image và link là tuỳ chọn
 * ===================================================================
 */
const TEAM = {
  name: "TALES",
  tagline: "Năm con người · Năm thế giới · Một câu chuyện",

  members: [
    {
      id: "member-1",
      name: "Nguyễn Văn A",
      role: "Frontend Developer",
      tagline: "Biến pixel thành trải nghiệm.",
      color: "#22d3ee",
      bio: "Giới thiệu ngắn về bản thân: bạn là ai, bạn làm gì trong team, điều gì khiến bạn hứng thú với công việc này.",
      stats: [
        { value: "4+", label: "Năm kinh nghiệm" },
        { value: "30", label: "Dự án" },
        { value: "∞", label: "Ly cà phê" },
      ],
      skills: ["React", "TypeScript", "CSS Animation", "Figma"],
      projects: [
        {
          title: "Tên dự án nổi bật",
          year: "2026",
          description: "Mô tả ngắn: dự án là gì, bạn đã đóng góp gì, kết quả ra sao.",
          tags: ["React", "Next.js"],
          link: "#",
        },
        {
          title: "Dự án thứ hai",
          year: "2025",
          description: "Mô tả ngắn về dự án.",
          tags: ["Vue"],
        },
        {
          title: "Giải thưởng / thành tích",
          year: "2024",
          description: "Ví dụ: Top 3 hackathon ABC.",
          tags: ["Award"],
        },
      ],
      socials: [
        { label: "GitHub", url: "#" },
        { label: "Facebook", url: "#" },
      ],
    },
    {
      id: "member-2",
      name: "Trần Thị B",
      role: "UI/UX Designer",
      tagline: "Thiết kế là kể chuyện bằng hình.",
      color: "#f472b6",
      bio: "Giới thiệu ngắn về bản thân: bạn là ai, bạn làm gì trong team, điều gì khiến bạn hứng thú với công việc này.",
      stats: [
        { value: "3+", label: "Năm kinh nghiệm" },
        { value: "120", label: "Màn hình đã vẽ" },
        { value: "12", label: "Brand identity" },
      ],
      skills: ["Figma", "Illustrator", "Design System", "Prototyping"],
      projects: [
        {
          title: "Redesign ứng dụng XYZ",
          year: "2026",
          description: "Mô tả ngắn: dự án là gì, bạn đã đóng góp gì, kết quả ra sao.",
          tags: ["UI", "UX Research"],
          link: "#",
        },
        {
          title: "Bộ nhận diện thương hiệu",
          year: "2025",
          description: "Mô tả ngắn về dự án.",
          tags: ["Branding"],
        },
      ],
      socials: [
        { label: "Behance", url: "#" },
        { label: "Dribbble", url: "#" },
      ],
    },
    {
      id: "member-3",
      name: "Lê Văn C",
      role: "Backend Engineer",
      tagline: "Những thứ bạn không thấy mới là thứ giữ mọi thứ chạy.",
      color: "#a3e635",
      bio: "Giới thiệu ngắn về bản thân: bạn là ai, bạn làm gì trong team, điều gì khiến bạn hứng thú với công việc này.",
      stats: [
        { value: "5+", label: "Năm kinh nghiệm" },
        { value: "99.9%", label: "Uptime" },
        { value: "40", label: "API đã viết" },
      ],
      skills: ["Node.js", "Go", "PostgreSQL", "Docker"],
      projects: [
        {
          title: "Hệ thống thanh toán",
          year: "2026",
          description: "Mô tả ngắn: dự án là gì, bạn đã đóng góp gì, kết quả ra sao.",
          tags: ["Go", "Microservices"],
        },
        {
          title: "Realtime chat server",
          year: "2025",
          description: "Mô tả ngắn về dự án.",
          tags: ["WebSocket", "Redis"],
          link: "#",
        },
      ],
      socials: [
        { label: "GitHub", url: "#" },
        { label: "LinkedIn", url: "#" },
      ],
    },
    {
      id: "member-4",
      name: "Phạm Thị D",
      role: "Content & Marketing",
      tagline: "Câu chuyện hay cần người kể hay.",
      color: "#fbbf24",
      bio: "Giới thiệu ngắn về bản thân: bạn là ai, bạn làm gì trong team, điều gì khiến bạn hứng thú với công việc này.",
      stats: [
        { value: "1M+", label: "Lượt tiếp cận" },
        { value: "200", label: "Bài viết" },
        { value: "15", label: "Chiến dịch" },
      ],
      skills: ["Copywriting", "SEO", "Social Media", "Video"],
      projects: [
        {
          title: "Chiến dịch ra mắt sản phẩm",
          year: "2026",
          description: "Mô tả ngắn: dự án là gì, bạn đã đóng góp gì, kết quả ra sao.",
          tags: ["Campaign"],
        },
        {
          title: "Kênh TikTok của team",
          year: "2025",
          description: "Mô tả ngắn về dự án.",
          tags: ["Video", "Social"],
          link: "#",
        },
      ],
      socials: [
        { label: "TikTok", url: "#" },
        { label: "Instagram", url: "#" },
      ],
    },
    {
      id: "member-5",
      name: "Hoàng Văn E",
      role: "Project Manager",
      tagline: "Giữ con tàu đi đúng hướng.",
      color: "#a78bfa",
      bio: "Giới thiệu ngắn về bản thân: bạn là ai, bạn làm gì trong team, điều gì khiến bạn hứng thú với công việc này.",
      stats: [
        { value: "6+", label: "Năm kinh nghiệm" },
        { value: "25", label: "Dự án đã giao" },
        { value: "0", label: "Deadline trễ*" },
      ],
      skills: ["Agile", "Scrum", "Roadmap", "Leadership"],
      projects: [
        {
          title: "Điều phối dự án ABC",
          year: "2026",
          description: "Mô tả ngắn: dự án là gì, bạn đã đóng góp gì, kết quả ra sao.",
          tags: ["Management"],
        },
        {
          title: "Xây dựng quy trình làm việc",
          year: "2025",
          description: "Mô tả ngắn về dự án.",
          tags: ["Process"],
        },
      ],
      socials: [
        { label: "LinkedIn", url: "#" },
      ],
    },
  ],
};
