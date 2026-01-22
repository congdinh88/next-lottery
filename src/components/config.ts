import { PrizeType, PrizeConfig } from "../app/types";

export const PRIZE_ORDER: PrizeType[] = [
  "consolation3", "consolation2", "consolation1", "fourth2", "fourth1",
  "third3", "third2", "third1", "second2", "second1",
  "first", "special2", "special1",
];

export const prizeConfig: Record<string, PrizeConfig> = {
  consolation3: { name: "Giải Khuyến Khích - Sản Lượng Hanh Thông", total: 10 },
  consolation2: { name: "Giải Khuyến Khích - Cán Thép Sinh Lực", total: 10 },
  consolation1: { name: "Giải Khuyến Khích - Phôi Thép Khởi Nguồn", total: 10 },
  fourth2: { name: "Giải Tư - Gia Công Khởi Lộc", total: 10 },
  fourth1: { name: "Giải Tư - Thành Phẩm Như Ý", total: 10 },
  third3: { name: "Giải Ba - Bền Bỉ Khởi Đà", total: 5 },
  third2: { name: "Giải Ba - Chịu Nhiệt Vươn Cao", total: 5 },
  third1: { name: "Giải Ba - Ổn Định Tăng Tốc", total: 5 },
  second2: { name: "Giải Nhì - Tôi Luyện Bền Vững", total: 5 },
  second1: { name: "Giải Nhì - Cường Độ Tăng Trưởng", total: 5 },
  first: { name: "Giải Nhất - Thép Luyện Bứt Phá", total: 5 },
  special2: { name: "Giải Đặc Biệt - Gang Luyện Nền Tảng", total: 1 },
  special1: { name: "Giải Đặc Biệt - Thép Vàng Bền Vững", total: 1 },
};