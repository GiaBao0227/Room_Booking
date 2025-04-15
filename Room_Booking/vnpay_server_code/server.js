// --- START OF FILE /Room_Booking/vnpay_server_code/server.js ---
const express = require("express");
const crypto = require("crypto");
const moment = require("moment-timezone");
const querystring = require("qs"); // Using qs for consistency
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // Load .env variables from this directory

// --- LOG KIỂM TRA BIẾN MÔI TRƯỜNG KHI KHỞI ĐỘNG ---
console.log("--- Backend Server Starting ---");
console.log("[BE Debug] PORT:", process.env.PORT);
const isTmnCodeSet =
  !!process.env.VNP_TMNCODE &&
  process.env.VNP_TMNCODE !== "YOUR_SANDBOX_TMNCODE" &&
  process.env.VNP_TMNCODE.trim() !== "";
const isHashSecretSet =
  !!process.env.VNP_HASHSECRET &&
  process.env.VNP_HASHSECRET !== "YOUR_SANDBOX_HASHSECRET" &&
  process.env.VNP_HASHSECRET.trim() !== "";
console.log("[BE Debug] VNP_TMNCODE set:", isTmnCodeSet ? "Yes" : "NO!");
console.log("[BE Debug] VNP_HASHSECRET set:", isHashSecretSet ? "Yes" : "NO!");
console.log(
  "[BE Debug] FRONTEND_RETURN_BASE_URL:",
  process.env.FRONTEND_RETURN_BASE_URL
);
console.log("[BE Debug] VNP_URL:", process.env.VNP_URL);
console.log(
  "[BE Debug] VNP_RETURNURL (BE Handler):",
  process.env.VNP_RETURNURL
);
console.log("[BE Debug] VNP_IPNURL:", process.env.VNP_IPNURL);
console.log("-------------------------------");
// --- KẾT THÚC LOG KIỂM TRA ---

const app = express();
const port = process.env.PORT || 8888;

// === CẤU HÌNH MIDDLEWARE ===
const corsOptions = {
  origin: process.env.FRONTEND_RETURN_BASE_URL || "http://localhost:5173",
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  optionsSuccessStatus: 204,
};
console.log("[BE Info] CORS configured for origin:", corsOptions.origin);
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// === KẾT THÚC CẤU HÌNH MIDDLEWARE ===

// === HÀM HELPER ===
// Hàm này sắp xếp key và encode cả key và value, thay %20 bằng +
// Dùng cho cả tạo URL gửi đi và xác thực IPN/Return URL để đảm bảo nhất quán
function sortObjectAndEncodeValues(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    // Chỉ xử lý các thuộc tính của chính object, không phải từ prototype
    if (obj.hasOwnProperty(key)) {
      // Chỉ encode key ở đây để phục vụ việc sắp xếp
      str.push(encodeURIComponent(key));
    }
  }
  str.sort(); // Sắp xếp các key đã encode theo alphabet
  for (let i = 0; i < str.length; i++) {
    const sortedKeyEncoded = str[i];
    const originalKey = decodeURIComponent(sortedKeyEncoded); // Lấy lại key gốc để truy cập giá trị
    const value = obj[originalKey];

    // Chỉ thêm vào object kết quả nếu value không phải null/undefined/rỗng
    if (value !== null && value !== undefined && value !== "") {
      // Encode cả key và value, sau đó thay thế %20 bằng +
      sorted[sortedKeyEncoded] = encodeURIComponent(value).replace(/%20/g, "+");
    }
  }
  return sorted;
}
// === KẾT THÚC HÀM HELPER ===

// === CÁC ENDPOINT API ===

// --- Endpoint: Create VNPAY Payment URL ---
app.post("/api/payments/create-vnpay-url", (req, res) => {
  console.log("[BE /create-vnpay-url] Received request:", req.body);
  try {
    const secretKey = process.env.VNP_HASHSECRET?.trim();
    const tmnCode = process.env.VNP_TMNCODE?.trim();
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;

    if (!isTmnCodeSet || !isHashSecretSet || !vnpUrl || !returnUrl) {
      console.error(
        "[BE /create-vnpay-url] FATAL: Missing or invalid VNPAY configuration."
      );
      return res
        .status(500)
        .json({ code: "99", message: "Server configuration error." });
    }

    const date = new Date();
    const createDate = moment(date)
      .tz("Asia/Ho_Chi_Minh")
      .format("YYYYMMDDHHmmss");
    const orderId =
      req.body.orderId ||
      `ORD${moment(date).tz("Asia/Ho_Chi_Minh").format("YYMMDDHHmmssSSS")}`;
    const amount = Number(req.body.amount);
    const orderInfo = (req.body.orderInfo || `Thanh toan don hang ${orderId}`)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-_]/g, "")
      .substring(0, 250);
    const orderType = req.body.orderType || "other";
    const locale = req.body.locale || "vn";
    const bankCode = req.body.bankCode || "";
    const ipAddr =
      req.headers["x-forwarded-for"]?.split(",").shift()?.trim() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      "127.0.0.1";
    const expireDate = moment(date)
      .add(30, "minutes")
      .tz("Asia/Ho_Chi_Minh")
      .format("YYYYMMDDHHmmss");

    if (isNaN(amount) || amount <= 1000) {
      console.error(
        "[BE /create-vnpay-url] Error: Invalid amount received:",
        req.body.amount
      );
      return res
        .status(400)
        .json({ code: "01", message: "Invalid amount (must be > 1000 VND)" });
    }

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo; // Giá trị gốc trước khi encode
    vnp_Params["vnp_OrderType"] = orderType;
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_ExpireDate"] = expireDate;
    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    // Dùng hàm helper để sắp xếp và mã hóa
    const sortedParams = sortObjectAndEncodeValues(vnp_Params);
    // Tạo chuỗi query string từ object đã sắp xếp và mã hóa
    const signData = querystring.stringify(sortedParams, { encode: false });
    console.log(
      "[BE /create-vnpay-url] String to Hash (before signing):",
      signData
    );

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    sortedParams["vnp_SecureHash"] = signed; // Thêm hash vào object đã sắp xếp

    // Tạo URL cuối cùng
    const paymentUrl =
      vnpUrl + "?" + querystring.stringify(sortedParams, { encode: false });

    console.log("[BE /create-vnpay-url] Successfully created VNPAY URL.");
    res.status(200).json({ code: "00", paymentUrl: paymentUrl });
  } catch (error) {
    console.error("[BE /create-vnpay-url] Error creating VNPAY URL:", error);
    res
      .status(500)
      .json({
        code: "99",
        message: "Server error while creating payment URL.",
      });
  }
});

// --- Endpoint: Handle IPN ---
app.get("/api/payments/vnpay-ipn", (req, res) => {
  console.log(
    "[BE /vnpay-ipn] Received IPN:",
    JSON.stringify(req.query, null, 2)
  );
  let vnp_Params = { ...req.query };
  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  const secretKey = process.env.VNP_HASHSECRET?.trim();
  if (!isHashSecretSet) {
    console.error("[BE /vnpay-ipn] Error: Missing or placeholder HashSecret.");
    return res
      .status(200)
      .json({
        RspCode: "99",
        Message: "Internal Server Error (Missing Config)",
      });
  }

  // *** TẠO CHUỖI HASH ĐỂ KIỂM TRA IPN - Dùng hàm helper nhất quán ***
  const sortedParamsCheck = sortObjectAndEncodeValues(vnp_Params);
  const signDataString = querystring.stringify(sortedParamsCheck, {
    encode: false,
  });
  console.log(
    "[BE /vnpay-ipn] String to hash for IPN check (Encoded):",
    signDataString
  );

  const hmac = crypto.createHmac("sha512", secretKey);
  const calculatedHash = hmac
    .update(Buffer.from(signDataString, "utf-8"))
    .digest("hex");

  const orderId = vnp_Params["vnp_TxnRef"];
  const rspCode = vnp_Params["vnp_ResponseCode"];
  const amount = parseInt(vnp_Params["vnp_Amount"]) / 100;
  const vnpTranId = vnp_Params["vnp_TransactionNo"];

  // --- KIỂM TRA CHỮ KÝ ---
  if (secureHash === calculatedHash) {
    console.log(
      `[BE /vnpay-ipn] CHECKSUM VALID for Order ID: ${orderId}, VNP TranId: ${vnpTranId}`
    );
    // --- KIỂM TRA DB ---
    console.log("[BE /vnpay-ipn] TODO: Check Order in Database...");
    let orderExists = true;
    let expectedAmount = amount;
    let amountMatches = expectedAmount === amount;
    let orderIsPending = true;
    console.log(
      `[BE /vnpay-ipn] DB Check Simulation - Exists: ${orderExists}, Amount Matches: ${amountMatches}, Is Pending: ${orderIsPending}`
    );
    if (orderExists && amountMatches) {
      if (orderIsPending) {
        if (rspCode === "00") {
          /* Xử lý thành công */
        } else {
          /* Xử lý thất bại */
        }
        // ... (Logic xử lý và phản hồi VNPAY như trước)
        if (rspCode === "00") {
          res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
        } else {
          res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
        }
      } else {
        res
          .status(200)
          .json({ RspCode: "02", Message: "Order already confirmed" });
      }
    } else if (!orderExists) {
      res.status(200).json({ RspCode: "01", Message: "Order not found" });
    } else {
      res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
    }
  } else {
    // ... (Log lỗi checksum sai) ...
    console.error(
      `[BE /vnpay-ipn] Error: Invalid Checksum for Order ID: ${orderId}.`
    );
    res.status(200).json({ RspCode: "97", Message: "Invalid Checksum" });
  }
});

// --- Endpoint: Handle Browser Redirect (Return URL) ---
app.get("/payment/vnpay_return_be_handler", (req, res) => {
  console.log("----------------------------------------------------");
  console.log(
    "[BE /vnpay_return] Received raw query params:",
    JSON.stringify(req.query, null, 2)
  );
  console.log("----------------------------------------------------");

  let vnp_Params = { ...req.query };
  let secureHash = vnp_Params["vnp_SecureHash"];

  console.log(
    `[BE /vnpay_return] Received Hash (vnp_SecureHash): ${secureHash}`
  );

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  const secretKey = process.env.VNP_HASHSECRET?.trim();
  const frontendBaseUrl = process.env.FRONTEND_RETURN_BASE_URL;

  if (!isHashSecretSet) {
    /* ... lỗi ... */
  }
  if (!frontendBaseUrl) {
    /* ... lỗi ... */
  }

  // *** QUAY LẠI: SỬ DỤNG HÀM HELPER NHẤT QUÁN ĐỂ TẠO HASH KIỂM TRA ***
  // Hàm này sẽ sắp xếp key, encode key và value, thay %20 bằng +
  const sortedParamsCheck = sortObjectAndEncodeValues(vnp_Params);
  const signDataString = querystring.stringify(sortedParamsCheck, {
    encode: false,
  });
  console.log(
    "[BE /vnpay_return] String to hash for return check (Using consistent helper):",
    signDataString
  );
  // *** KẾT THÚC SỬA CÁCH TẠO CHUỖI HASH ***

  const hmac = crypto.createHmac("sha512", secretKey);
  const calculatedHash = hmac
    .update(Buffer.from(signDataString, "utf-8"))
    .digest("hex");
  console.log(`[BE /vnpay_return] Calculated Hash: ${calculatedHash}`);

  const rspCode = vnp_Params["vnp_ResponseCode"];
  const orderId = vnp_Params["vnp_TxnRef"];
  const originalQueryString = querystring.stringify(req.query, {
    encode: true,
  });

  // --- So sánh chữ ký ---
  if (secureHash === calculatedHash) {
    console.log(
      `[BE /vnpay_return] CHECKSUM VALID for Order ID: ${orderId}. RspCode: ${rspCode}`
    );
    if (rspCode === "00") {
      console.log(
        "[BE /vnpay_return] Payment Success. Redirecting to FE success page..."
      );
      res.redirect(`${frontendBaseUrl}/payment-success?${originalQueryString}`);
    } else {
      console.log(
        `[BE /vnpay_return] Payment Failed (RspCode: ${rspCode}). Redirecting to FE failed page...`
      );
      res.redirect(`${frontendBaseUrl}/payment-failed?${originalQueryString}`);
    }
  } else {
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error(
      `[BE /vnpay_return] >>> CHECKSUM INVALID <<< for Order ID: ${orderId}.`
    );
    console.error(`  Received Hash : ${secureHash}`);
    console.error(`  Calculated Hash: ${calculatedHash}`);
    console.error(`  Based on String: ${signDataString}`); // String đã được sửa
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    res.redirect(
      `${frontendBaseUrl}/payment-failed?error=checksum_invalid&orderId=${orderId}&code=97`
    );
  }
});

// --- Basic Root Route ---
app.get("/", (req, res) => {
  res.send("VNPAY Integration Backend is running!");
});
// === KẾT THÚC ENDPOINT API ===

// --- Khởi động Server và Bắt lỗi ---
app
  .listen(port, () => {
    /* ... log khởi động ... */
  })
  .on("error", (err) => {
    /* ... xử lý lỗi khởi động ... */
  });
// --- END OF FILE /Room_Booking/vnpay_server_code/server.js ---
