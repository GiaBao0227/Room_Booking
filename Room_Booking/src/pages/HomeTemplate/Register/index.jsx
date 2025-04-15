// src/pages/HomeTemplate/Register/index.jsx (Sửa cho /auth/signup)

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
// *** CẦN LẠI DatePicker và Radio ***
import {
  Form,
  Input,
  Button,
  Typography,
  DatePicker,
  Radio,
  Spin,
  message,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { actRegister, resetRegister } from "./slice";
// import styles from './Register.module.css'; // Bỏ nếu không dùng

const { Title, Text } = Typography;

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Key trong store là 'registerReducer' (theo store.js bạn cung cấp)
  const {
    loading,
    error,
    data: registerSuccessData,
  } = useSelector((state) => state.registerReducer);

  // Effect xử lý message lỗi/thành công và redirect
  useEffect(() => {
    if (error) {
      message.error(`Đăng ký thất bại: ${error}`); /* Không cần reset ở đây */
    }
    if (registerSuccessData) {
      message.success(
        registerSuccessData.message || "Đăng ký thành công! Vui lòng đăng nhập."
      );
      dispatch(resetRegister());
      form.resetFields();
      navigate("/login");
    }
  }, [error, registerSuccessData, dispatch, navigate, form]);

  // Hàm xử lý submit form AntD
  const onFinish = (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      form.setFields([
        { name: "confirmPassword", errors: ["Mật khẩu không khớp!"] },
      ]);
      return;
    }

    // *** CHUẨN BỊ PAYLOAD CHO /api/auth/signup ***
    const payload = {
      // API yêu cầu 'name', không phải 'hoTen'
      name: values.hoTen,
      email: values.email,
      password: values.password,
      // API yêu cầu 'phone', không phải 'soDt'
      phone: values.soDt,
      // API yêu cầu 'birthday' dạng string 'YYYY-MM-DD'
      birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : "",
      // API yêu cầu 'gender' dạng boolean
      gender: values.gender === "male", // true = Nam, false = Nữ
      // API yêu cầu 'role', để trống cho KhachHang
      role: "",
      // *** API signup KHÔNG yêu cầu taiKhoan, maNhom ***
      // taiKhoan: values.taiKhoan, // Bỏ đi
      // maNhom: "GP01", // Bỏ đi
    };

    console.log("Submitting signup payload:", payload);
    dispatch(actRegister(payload)); // Dispatch action đăng ký
  };

  const onFinishFailed = (errorInfo) => {
    console.log("AntD Form Register Failed:", errorInfo);
    message.warning("Vui lòng điền đầy đủ và đúng thông tin.");
  };

  // Clear state khi unmount
  useEffect(() => {
    return () => {
      dispatch(resetRegister());
    };
  }, [dispatch]);

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-140px)] bg-gray-50">
      <Spin spinning={loading} tip="Đang xử lý...">
        <div className="w-full max-w-lg space-y-8 p-10 bg-white shadow-xl rounded-xl border border-gray-200">
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "30px" }}
          >
            {" "}
            Đăng Ký Tài Khoản{" "}
          </Title>
          <Form
            form={form}
            name="signup_form"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            autoComplete="off"
          >
            {/* SỬ DỤNG CÁC TRƯỜNG ĐÚNG THEO API SIGNUP */}
            <Form.Item
              label="Họ và Tên"
              name="hoTen"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nguyễn Văn A"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không đúng định dạng!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="email@example.com"
                size="large"
              />
            </Form.Item>

            {/* Bỏ trường Tài khoản (taiKhoan) */}

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu cần ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Ít nhất 6 ký tự"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận Mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="soDt"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/,
                  message: "Số điện thoại Việt Nam không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="09xxxxxxxx"
                size="large"
              />
            </Form.Item>

            {/* THÊM LẠI TRƯỜNG NGÀY SINH VÀ GIỚI TÍNH */}
            <Form.Item
              label="Ngày sinh"
              name="birthday"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                size="large"
                picker="date"
              />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
              </Radio.Group>
            </Form.Item>

            {/* Lỗi API đã hiển thị bằng message */}

            <Form.Item style={{ marginTop: "20px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                danger
              >
                Đăng Ký
              </Button>
            </Form.Item>
            <Text
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-red-600 font-medium hover:text-red-500"
              >
                Đăng nhập ngay
              </Link>
            </Text>
          </Form>
        </div>
      </Spin>
    </div>
  );
};

export default RegisterPage;
