import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Avatar,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Radio,
  message,
  Row,
  Col,
  Typography,
  Upload,
  Divider,
  Tabs,
  Table,
  Tag,
} from "antd";
const { Title, Text, Paragraph } = Typography;
import {
  UserOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  UploadOutlined,
  LoadingOutlined,
  PlusOutlined,
  HistoryOutlined,
  TransactionOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";

import {
  fetchUserProfile,
  fetchUserBookingHistory,
  updateUserProfile,
  clearProfileState,
  selectProfileData,
  selectBookingHistory,
  selectProfileLoading,
  selectHistoryLoading,
  selectProfileError,
  selectHistoryError,
  selectUpdateProfileLoading,
  selectUpdateProfileSuccess,
  clearUpdateStatus,
} from "./slice";
import { selectUserData } from "../Login/slice";
import Header from "./../_Component/Header/index";
import Footer from "./../_Component/Footer/index";

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  if (
    typeof dateTimeString === "string" &&
    dateTimeString.length === 14 &&
    /^\d+$/.test(dateTimeString)
  ) {
    try {
      const year = dateTimeString.substring(0, 4);
      const month = dateTimeString.substring(4, 6);
      const day = dateTimeString.substring(6, 8);
      const hour = dateTimeString.substring(8, 10);
      const minute = dateTimeString.substring(10, 12);
      const second = dateTimeString.substring(12, 14);
      const date = moment(
        `${year}-${month}-${day} ${hour}:${minute}:${second}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      return date.isValid() ? date.format("DD/MM/YYYY HH:mm:ss") : "-";
    } catch {}
  }
  const date = moment(dateTimeString);
  return date.isValid() ? date.format("DD/MM/YYYY HH:mm:ss") : "-";
};

const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "-";
  return `${amount.toLocaleString("vi-VN")} VND`;
};

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const currentUser = useSelector(selectUserData);
  const userId = currentUser?.id;

  const profileData = useSelector(selectProfileData);
  const bookingHistory = useSelector(selectBookingHistory);
  const profileLoading = useSelector(selectProfileLoading);
  const historyLoading = useSelector(selectHistoryLoading);
  const profileError = useSelector(selectProfileError);
  const historyError = useSelector(selectHistoryError);
  const updateLoading = useSelector(selectUpdateProfileLoading);
  const updateSuccess = useSelector(selectUpdateProfileSuccess);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarFileList, setAvatarFileList] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  const [localTransactionHistory, setLocalTransactionHistory] = useState([]);
  const [loadingLocalHistory, setLoadingLocalHistory] = useState(true);

  useEffect(() => {
    setLoadingLocalHistory(true);
    if (userId) {
      if (typeof fetchUserProfile === "function")
        dispatch(fetchUserProfile(userId));
      if (typeof fetchUserBookingHistory === "function")
        dispatch(fetchUserBookingHistory(userId));

      try {
        const storedHistory = localStorage.getItem("transactionHistory");
        let parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
        parsedHistory = Array.isArray(parsedHistory) ? parsedHistory : [];

        const processedHistory = parsedHistory.map((item, index) => ({
          ...item,
          _localId:
            item.vnpTransactionNo ||
            item.orderId ||
            `local-tx-${index}-${Date.now()}`,
        }));
        setLocalTransactionHistory(processedHistory);
      } catch (error) {
        console.error(
          "Failed to load/parse transaction history from localStorage:",
          error
        );
        message.error("Không thể tải lịch sử giao dịch cục bộ.");
        setLocalTransactionHistory([]);
      } finally {
        setLoadingLocalHistory(false);
      }
    } else {
      setLoadingLocalHistory(false);
      setLocalTransactionHistory([]);
    }
    return () => {
      if (typeof clearProfileState === "function")
        dispatch(clearProfileState());
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (profileData?.avatar) {
      setAvatarPreviewUrl(profileData.avatar);
      setAvatarFileList([]);
    } else {
      setAvatarPreviewUrl("");
      setAvatarFileList([]);
    }
  }, [profileData?.avatar]);

  useEffect(() => {
    if (profileError) message.error(`Lỗi tải thông tin: ${profileError}`);
    if (historyError)
      message.error(`Lỗi tải lịch sử đặt phòng: ${historyError}`);
  }, [profileError, historyError]);

  useEffect(() => {
    if (updateSuccess) {
      setIsModalOpen(false);
      if (typeof clearUpdateStatus === "function")
        dispatch(clearUpdateStatus());
      if (userId && typeof fetchUserProfile === "function")
        dispatch(fetchUserProfile(userId));
      setAvatarFileList([]);
    }
  }, [updateSuccess, dispatch, userId]);

  const showModal = () => {
    if (profileData) {
      form.setFieldsValue({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        gender:
          typeof profileData.gender === "boolean"
            ? profileData.gender
              ? "male"
              : "female"
            : undefined,
        birthday: profileData.birthday
          ? moment(profileData.birthday, "YYYY-MM-DD")
          : undefined,
      });
      setAvatarPreviewUrl(profileData.avatar || "");
      setAvatarFileList([]);
      setIsModalOpen(true);
    } else {
      message.error("Chưa có dữ liệu hồ sơ để chỉnh sửa.");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    if (typeof clearUpdateStatus === "function") dispatch(clearUpdateStatus());
    setAvatarPreviewUrl(profileData?.avatar || "");
    setAvatarFileList([]);
  };

  const handleUpdateProfileAndAvatar = async (values) => {
    const profilePayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
      gender: values.gender === "male",
      role: profileData?.role || "USER",
    };

    let avatarUploadPromise = Promise.resolve(null);

    if (avatarFileList.length > 0 && avatarFileList[0].originFileObj) {
      const file = avatarFileList[0].originFileObj;

      // --- !!! IMPORTANT: ACTUAL BACKEND AVATAR UPLOAD LOGIC GOES HERE !!! ---
      console.log("Preparing to upload avatar (manual trigger)...");
      setAvatarLoading(true);
      avatarUploadPromise = new Promise(async (resolve, reject) => {
        try {
          // Replace this simulation with your actual API call
          // const formData = new FormData();
          // formData.append('avatar', file);
          // const response = await api.post(`/users/upload-avatar/${userId}`, formData); // Use your API service
          // if (response.data.success && response.data.avatarUrl) {
          //     resolve(response.data.avatarUrl);
          // } else {
          //     throw new Error(response.data.message || 'Upload failed');
          // }

          // --- Simulation ---
          await new Promise((res) => setTimeout(res, 1500));
          const simulatedNewUrl = URL.createObjectURL(file); // Temporary client-side URL
          console.log("Avatar upload successful (Simulated)");
          resolve(simulatedNewUrl);
          // --- End Simulation ---
        } catch (error) {
          console.error("Avatar upload failed:", error);
          message.error("Upload ảnh đại diện thất bại!");
          reject(error);
        } finally {
          setAvatarLoading(false);
        }
      });
      // --- !!! END OF BACKEND UPLOAD LOGIC ---
    }

    try {
      const newAvatarUrl = await avatarUploadPromise; // Wait for upload if any

      // Proceed with profile update regardless of avatar upload *result* for now
      // Adjust logic if profile update depends on successful avatar upload
      if (userId && typeof updateUserProfile === "function") {
        // If your PUT endpoint accepts the new avatar URL, add it here:
        // if (newAvatarUrl) profilePayload.avatar = newAvatarUrl;

        console.log(
          "Dispatching updateUserProfile with payload:",
          profilePayload
        );
        dispatch(updateUserProfile({ userId, userData: profilePayload }));
      } else if (!userId) {
        message.error("Không tìm thấy ID người dùng để cập nhật.");
      } else if (typeof updateUserProfile !== "function") {
        message.error("Chức năng cập nhật hồ sơ không khả dụng.");
      }
    } catch (error) {
      // Avatar upload failed, error already shown. Profile update is skipped if it depends on avatar.
      console.log(
        "Profile update potentially skipped due to avatar upload failure."
      );
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
      setAvatarLoading(false);
      setAvatarFileList([]);
      setAvatarPreviewUrl(profileData?.avatar || "");
      return Upload.LIST_IGNORE;
    }
    // Return false to prevent auto-upload, allowing manual handling via onChange
    return false;
  };

  const handleAvatarChange = (info) => {
    const latestFile = info.fileList.slice(-1)[0];

    if (!latestFile) {
      setAvatarFileList([]);
      setAvatarPreviewUrl(profileData?.avatar || "");
      setAvatarLoading(false);
      form.setFieldsValue({ avatarUpload: [] });
      return;
    }

    // Use the file from the event for preview, even if auto-upload is prevented
    if (latestFile.originFileObj) {
      setAvatarLoading(true); // Show loading while generating preview
      getBase64(latestFile.originFileObj, (imageUrl) => {
        setAvatarPreviewUrl(imageUrl);
        setAvatarLoading(false);
        // Update state list with the file (status might be 'null' or similar initially)
        setAvatarFileList([{ ...latestFile, status: "selected" }]); // Use a custom status?
        form.setFieldsValue({
          avatarUpload: [{ ...latestFile, status: "selected" }],
        });
      });
    } else if (latestFile.url) {
      // Handle case where file comes from initial data (already has URL)
      setAvatarPreviewUrl(latestFile.url);
      setAvatarFileList([latestFile]);
      form.setFieldsValue({ avatarUpload: [latestFile] });
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {avatarLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const historyColumns = [
    {
      title: "Mã Phòng",
      dataIndex: "maPhong",
      key: "maPhong",
      width: 100,
      render: (id) => (id ? <Link to={`/detailroom/${id}`}>{id}</Link> : "-"),
    },
    {
      title: "Ngày Đến",
      dataIndex: "ngayDen",
      key: "ngayDen",
      width: 160,
      render: (date) => formatDateTime(date),
      sorter: (a, b) => moment(a.ngayDen).unix() - moment(b.ngayDen).unix(),
    },
    {
      title: "Ngày Đi",
      dataIndex: "ngayDi",
      key: "ngayDi",
      width: 160,
      render: (date) => formatDateTime(date),
      sorter: (a, b) => moment(a.ngayDi).unix() - moment(b.ngayDi).unix(),
    },
    {
      title: "Số Khách",
      dataIndex: "soLuongKhach",
      key: "soLuongKhach",
      align: "center",
      width: 100,
    },
    {
      title: "Chi tiết phòng",
      key: "action",
      align: "center",
      width: 100,
      render: (_, record) =>
        record.maPhong ? (
          <Link to={`/detailroom/${record.maPhong}`}>
            <Button type="link" size="small">
              Xem
            </Button>
          </Link>
        ) : null,
    },
  ];

  const transactionColumns = [
    {
      title: "Ngày GD",
      dataIndex: "transactionDate",
      key: "transactionDate",
      width: 160,
      render: (date) => formatDateTime(date),
      sorter: (a, b) =>
        moment(a.transactionDate).unix() - moment(b.transactionDate).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Mã Đơn Hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 180,
      render: (text) => text || "-",
    },
    {
      title: "Số Tiền",
      dataIndex: "amount",
      key: "amount",
      width: 130,
      align: "right",
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => {
        if (status === "success")
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Thành công
            </Tag>
          );
        if (status === "failed")
          return (
            <Tag icon={<CloseCircleOutlined />} color="error">
              Thất bại
            </Tag>
          );
        return <Tag color="default">{status || "Không rõ"}</Tag>;
      },
      filters: [
        { text: "Thành công", value: "success" },
        { text: "Thất bại", value: "failed" },
        { text: "Khác", value: "other" },
      ],
      onFilter: (value, record) => {
        if (value === "other")
          return record.status !== "success" && record.status !== "failed";
        return record.status === value;
      },
    },
    {
      title: "Mã GD VNPAY",
      dataIndex: "vnpTransactionNo",
      key: "vnpTransactionNo",
      width: 130,
      render: (text) => text || "-",
    },
    {
      title: "Ngân hàng",
      dataIndex: "bankCode",
      key: "bankCode",
      width: 100,
      render: (text) => text || "-",
    },
  ];

  const bookingHistoryContent = (
    <>
      {historyError ? (
        <Paragraph type="danger" className="text-center p-4">
          Không thể tải lịch sử đặt phòng: {historyError}
        </Paragraph>
      ) : (
        <Table
          columns={historyColumns}
          dataSource={bookingHistory || []}
          loading={historyLoading}
          rowKey="id"
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 750 }}
          size="small"
        />
      )}
    </>
  );

  const transactionHistoryContent = (
    <>
      {loadingLocalHistory ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Spin tip="Đang tải lịch sử cục bộ..." size="large" />
        </div>
      ) : localTransactionHistory && localTransactionHistory.length > 0 ? (
        <Table
          columns={transactionColumns}
          dataSource={localTransactionHistory}
          rowKey="_localId"
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          scroll={{ x: 900 }}
          size="small"
        />
      ) : (
        <Paragraph type="secondary" className="text-center p-4">
          Chưa có lịch sử giao dịch nào được lưu trữ trên trình duyệt này.
        </Paragraph>
      )}
    </>
  );

  const tabItems = [
    {
      key: "1",
      label: (
        <span className="flex items-center">
          <HistoryOutlined className="mr-2" /> Lịch sử đặt phòng
        </span>
      ),
      children: bookingHistoryContent,
    },
    {
      key: "2",
      label: (
        <span className="flex items-center">
          <TransactionOutlined className="mr-2" /> Lịch sử giao dịch
        </span>
      ),
      children: transactionHistoryContent,
    },
  ];

  if (profileLoading && !profileData && !profileError) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Đang tải hồ sơ..." />
        </div>
        <Footer />
      </>
    );
  }

  if (
    profileError &&
    !profileData &&
    !profileError.includes("401") &&
    !profileError.includes("403")
  ) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Title level={3} type="danger">
            Lỗi tải thông tin cá nhân
          </Title>
          <Paragraph type="secondary">{profileError}</Paragraph>
          <Paragraph>
            Vui lòng thử{" "}
            <a href="#" onClick={() => window.location.reload()}>
              tải lại trang
            </a>{" "}
            hoặc đăng nhập lại.
          </Paragraph>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 lg:px-16 xl:px-24">
        <Row gutter={{ xs: 16, md: 32, lg: 48 }}>
          <Col xs={24} md={8} lg={7} xl={6}>
            <div className="p-4 md:p-6 border rounded-xl shadow-md mb-6 sticky top-24 bg-white">
              <div className="flex flex-col items-center text-center">
                <Spin spinning={profileLoading && !!profileData}>
                  <Avatar
                    size={128}
                    icon={<UserOutlined />}
                    src={avatarPreviewUrl || profileData?.avatar}
                    className="mb-4 border-2 border-gray-200 shadow-sm"
                  />
                </Spin>
                <Title level={4} className="mb-1 truncate w-full px-2">
                  {profileData?.name || "Người dùng"}
                </Title>
                <Text type="secondary" className="text-sm mb-3">
                  {profileData?.email || "Chưa có email"}
                </Text>
                <Button
                  icon={<EditOutlined />}
                  onClick={showModal}
                  disabled={!profileData || profileLoading}
                  className="mb-4"
                >
                  Chỉnh sửa hồ sơ
                </Button>
              </div>

              <Divider className="my-4" />
              <div className="mb-5 px-2">
                <SafetyCertificateOutlined className="text-lg mr-2 align-middle text-gray-600" />
                <Title
                  level={5}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    fontWeight: 600,
                  }}
                  className="font-semibold"
                >
                  Xác minh danh tính
                </Title>
                <Paragraph type="secondary" className="mt-1 text-sm">
                  Xác thực danh tính của bạn với huy hiệu xác minh danh tính.
                </Paragraph>
                <Button abled className="w-full">
                  Nhận huy hiệu
                </Button>
              </div>
              <Divider className="my-4" />
              <div className="px-2">
                <Title level={5} style={{ fontWeight: 600 }}>
                  {profileData?.name || "Người dùng"} đã xác nhận
                </Title>
                <ul className="list-none p-0 mt-2 space-y-1">
                  {profileData?.email && (
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircleFilled className="text-green-600 mr-2" /> Địa
                      chỉ email
                    </li>
                  )}
                  {profileData?.phone && (
                    <li className="flex items-center text-sm text-gray-700">
                      <CheckCircleFilled className="text-green-600 mr-2" /> Số
                      điện thoại
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Col>

          <Col xs={24} md={16} lg={17} xl={18}>
            <Spin spinning={profileLoading && !!profileData}>
              <Title level={2} className="font-bold mb-1">
                {profileData?.name
                  ? `Xin chào, tôi là ${profileData.name}`
                  : "Hồ sơ của bạn"}
              </Title>
              <Text type="secondary" className="text-sm block mb-4">
                {profileData?.createdAt
                  ? `Tham gia vào ${moment(profileData.createdAt).format(
                      "MM/YYYY"
                    )}`
                  : "Chào mừng bạn!"}
              </Text>
            </Spin>

            {userId ? (
              <Tabs
                defaultActiveKey="1"
                items={tabItems}
                type="line"
                size="large"
                className="mt-4"
              />
            ) : (
              <Paragraph className="mt-6 text-center text-lg">
                Vui lòng <Link to="/login">đăng nhập</Link> để xem thông tin và
                lịch sử của bạn.
              </Paragraph>
            )}
          </Col>
        </Row>

        <Modal
          title="Chỉnh sửa hồ sơ"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={[
            <Button
              key="back"
              onClick={handleCancel}
              disabled={updateLoading || avatarLoading}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={updateLoading || avatarLoading}
              onClick={() => form.submit()}
              disabled={avatarLoading}
            >
              Lưu thay đổi
            </Button>,
          ]}
          destroyOnClose
          maskClosable={false}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            name="update_profile_form"
            onFinish={handleUpdateProfileAndAvatar}
          >
            <Form.Item
              label="Ảnh đại diện"
              name="avatarUpload"
              help="Chọn ảnh định dạng JPG/PNG."
              className="flex flex-col items-center mb-0"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleAvatarChange}
                maxCount={1}
                accept="image/png, image/jpeg"
                fileList={avatarFileList} // Controlled component
              >
                {avatarPreviewUrl ? (
                  <img
                    src={avatarPreviewUrl}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
            <Divider />
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Họ và Tên"
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Số điện thoại không hợp lệ!",
                    },
                  ]}
                >
                  <Input placeholder="09xxxxxxxx" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Địa chỉ email không hợp lệ!" },
              ]}
            >
              <Input placeholder="email@example.com" disabled />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Ngày sinh" name="birthday">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính!" },
                  ]}
                >
                  <Radio.Group>
                    <Radio value="male">Nam</Radio>
                    <Radio value="female">Nữ</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
