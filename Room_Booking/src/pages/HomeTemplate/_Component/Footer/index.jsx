import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Cột 1 */}
          <div>
            <h3 className="font-semibold mb-2">GIỚI THIỆU</h3>
            <ul>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Cách Airbnb hoạt động
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Nhà đầu tư
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Airbnb Luxe
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  HotelTonight
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Airbnb.org
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Cơ hội nghề nghiệp
                </a>
              </li>
            </ul>
          </div>
          {/* Cột 2 */}
          <div>
            <h3 className="font-semibold mb-2">CỘNG ĐỒNG</h3>
            <ul>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Tính đa dạng và hòa nhập
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Khả năng tiếp cận Airbnb
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Đối tác liên kết Airbnb
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Chỗ ở cho người tị nạn
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Báo cáo mối lo ngại
                </a>
              </li>
            </ul>
          </div>
          {/* Cột 3 */}
          <div>
            <h3 className="font-semibold mb-2">ĐÓN TIẾP KHÁCH</h3>
            <ul>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Thử đón tiếp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  AirCover cho chủ nhà
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Tài nguyên đón tiếp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Diễn đàn cộng đồng
                </a>
              </li>
            </ul>
          </div>
          {/* Cột 4 */}
          <div>
            <h3 className="font-semibold mb-2">HỖ TRỢ</h3>
            <ul>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Các tùy chọn hủy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Hỗ trợ cộng đồng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Tin cậy và an toàn
                </a>
              </li>
            </ul>
          </div>
          {/* Cột 5 */}
          <div>
            <h3 className="font-semibold mb-2">Airbnb</h3>
            <ul>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Các tùy chọn hủy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-black text-sm">
                  Các tùy chọn hủy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 border-t pt-4">
          <div className="text-gray-500 text-sm">
            © 2024 Airbnb, Inc.
            <span className="md:ml-4">
              <a href="#" className="hover:underline">
                Điều khoản
              </a>
            </span>
            <span className="md:ml-4">
              <a href="#" className="hover:underline">
                Sơ đồ trang web
              </a>
            </span>
          </div>
          <div className="flex items-center mt-2 md:mt-0">
            <div className="flex items-center text-gray-500 text-sm">
              <FontAwesomeIcon icon={faGlobe} className="mr-2" />
              <select className="bg-transparent border-none focus:outline-none">
                <option>Tiếng Việt (VN)</option>
              </select>
              <span className="ml-2">USD</span>
              <span className="ml-1">Hỗ trợ tài nguyên</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-black">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#" className="text-gray-500 hover:text-black">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" className="text-gray-500 hover:text-black">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
