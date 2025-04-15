// src/pages/HomeTemplate/Login/index.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Row,
  Col,
  Spin,
  message,
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
// *** IMPORT TỪ loginSlice ***
import {
  loginUser,
  selectUserData,
  selectLoginLoading,
  selectLoginError,
  clearLoginError,
  selectUserRoleFromLogin,
} from "./slice";
import styles from "./Login.module.css"; // Đảm bảo file CSS Module tồn tại

const { Title, Text } = Typography;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // *** SỬ DỤNG SELECTORS TỪ loginSlice (state.login) ***
  const isLoading = useSelector(selectLoginLoading);
  const loginError = useSelector(selectLoginError);
  const user = useSelector(selectUserData); // Lấy user data { name, email, role,... }
  const userRole = useSelector(selectUserRoleFromLogin); // Lấy role

  const [form] = Form.useForm();
  const fromPath = location.state?.from?.pathname || "/";

  // Effect xử lý message và redirect
  useEffect(() => {
    if (loginError) {
      message.error(loginError);
      dispatch(clearLoginError());
    }
    if (user) {
      message.success("Đăng nhập thành công!");
      // *** KIỂM TRA ROLE SAU KHI LOGIN THÀNH CÔNG ***
      if (userRole === "QuanTri") {
        console.warn("Admin logging in via user form. Redirecting to admin...");
        navigate("/admin/dashboard", { replace: true }); // Vẫn cho Admin redirect nếu login đúng
      } else {
        navigate(fromPath, { replace: true }); // Redirect người dùng thường
      }
    }
  }, [loginError, user, userRole, dispatch, navigate, fromPath]);

  // Submit form login (API /api/auth/signin)
  const handleLogin = (values) => {
    dispatch(loginUser({ email: values.email, password: values.password }));
  };

  const onFinishFailed = (errorInfo) => {
    message.warning("Vui lòng điền đủ thông tin.");
  };

  return (
    <div className={styles.loginContainer}>
      <Row justify="center" align="middle" className={styles.loginRow}>
        <Col xs={0} md={10} lg={12} className={styles.brandingCol}>
          {" "}
          {/* Branding */}{" "}
        </Col>
        <Col xs={24} sm={20} md={14} lg={12} className={styles.formCol}>
          <div className={styles.formWrapper}>
            <Spin spinning={isLoading} tip="Đang đăng nhập...">
              <Title level={2} className={styles.title}>
                Đăng Nhập
              </Title>
              <Text type="secondary" className={styles.subtitle}>
                Truy cập tài khoản của bạn
              </Text>
              <Form
                form={form}
                name="user_login_final"
                onFinish={handleLogin}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="vertical"
                className={styles.loginForm}
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email đăng nhập"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[{ required: true, message: "Nhập mật khẩu!" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Mật khẩu"
                    size="large"
                  />
                </Form.Item>
                {/* Lỗi hiển thị qua message */}
                <Form.Item style={{ marginTop: "25px" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    size="large"
                    block
                    danger
                    className={styles.loginButton}
                  >
                    {" "}
                    Đăng Nhập{" "}
                  </Button>
                </Form.Item>
                <Text className={styles.registerLink}>
                  {" "}
                  Chưa có tài khoản? <Link to="/register">
                    Đăng ký ngay!
                  </Link>{" "}
                </Text>
              </Form>
            </Spin>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default LoginPage;
