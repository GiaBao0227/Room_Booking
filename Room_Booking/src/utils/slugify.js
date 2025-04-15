// src/utils/slugify.js

// Hàm tạo slug viết liền, chữ thường, không dấu gạch ngang
// Nó sẽ giữ lại ký tự có dấu nếu không có bước loại bỏ dấu riêng
export const slugifyWithoutDash = (text) => {
  if (!text) return ""; // Xử lý input null/undefined
  return text
    .toString()
    .toLowerCase() // Chuyển thành chữ thường
    .replace(/\s+/g, ""); // Loại bỏ tất cả khoảng trắng
  // Thêm bước loại bỏ dấu tiếng Việt nếu muốn slug nhất quán hơn (ví dụ: hồ chí minh -> hochiminh)
  // .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  // .replace(/đ/g, "d") // Thay chữ đ thành d
  // Có thể thêm các bước replace khác nếu cần
};

// Hàm tạo slug có dấu gạch ngang (giữ lại để tham khảo hoặc dùng ở chỗ khác)
export const slugifyWithDash = (text) => {
  if (!text) return "";
  return (
    text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Thay khoảng trắng bằng gạch ngang
      // .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Bỏ dấu (tùy chọn)
      // .replace(/đ/g, "d")       // Thay đ thành d (tùy chọn)
      .replace(/[^\w-]+/g, "") // Loại bỏ ký tự không phải chữ, số, gạch dưới, gạch ngang
      .replace(/--+/g, "-") // Thay nhiều gạch ngang bằng 1
      .replace(/^-+/, "") // Xóa gạch ngang đầu chuỗi
      .replace(/-+$/, "")
  ); // Xóa gạch ngang cuối chuỗi (sửa typo = thành -)
};
