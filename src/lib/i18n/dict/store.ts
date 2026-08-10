const en = {
  // StoreNav
  navShop: "Shop",
  navCart: "Cart",
  navSignIn: "Sign in",
  navWholesale: "Wholesale",

  // Home page
  shopByCategory: "Shop by Category",
  allProducts: "All Products",
  noProductsYet: "No products available yet.",
  noProductsInCategory: "No products in this category yet.",

  // ProductCard / ProductDetail shared
  contactForPrice: "Contact for Price",
  inStock: "In Stock",
  outOfStock: "Out of Stock",
  onDemand: "On Demand",
  noImage: "No image",

  // Cart page
  cartEmpty: "Your cart is empty.",
  continueShopping: "Continue Shopping",
  yourCart: "Your Cart",
  subtotal: "Subtotal",
  proceedToCheckout: "Proceed to Checkout",

  // Account page
  myAccount: "My Account",
  nameLabel: "Name:",
  emailLabel: "Email:",
  phoneLabel: "Phone:",
  addressLabel: "Address:",
  orderHistory: "Order History",
  orderCol: "Order",
  placedCol: "Placed",
  itemsCol: "Items",
  totalCol: "Total",
  statusCol: "Status",
  noOrdersYet: "No orders yet.",

  // Login page
  signIn: "Sign In",
  emailPlaceholder: "Email",
  passwordPlaceholder: "Password",
  signingIn: "Signing in…",
  noAccount: "No account?",
  registerLink: "Register",

  // Register page
  createAccount: "Create Account",
  fullNamePlaceholder: "Full name",
  phoneOptionalPlaceholder: "Phone (optional)",
  creatingAccount: "Creating…",
  alreadyHaveAccount: "Already have an account?",
  signInLink: "Sign in",

  // LogoutButton
  signOut: "Sign Out",

  // account/actions.ts error keys
  errNameEmailPasswordRequired: "Name, email, and a password of at least 6 characters are required",
  errEmailExists: "An account with this email already exists",
  errInvalidCredentials: "Invalid email or password",
  errPleaseSignIn: "Please sign in",

  // Checkout page
  checkoutTitle: "Checkout",
  orderSummary: "Order Summary",
  shippingPlaceholder: "Shipping / pickup address",
  paymentCOD: "Cash on Delivery",
  paymentTransfer: "Bank Transfer",
  notesOptionalPlaceholder: "Notes (optional)",
  placingOrder: "Placing Order…",
  placeOrder: "Place Order",

  // checkout/actions.ts error keys
  errPleaseSignInCheckout: "Please sign in to check out",
  errShippingRequired: "Shipping address is required",
  errAccountNotFound: "Account not found",
  errOrderNotFound: "Order not found",
  errProofAlreadyConfirmed: "This order's payment has already been confirmed. Contact support if you need to change it.",
  errSelectImage: "Select an image to upload",
  errUploadFailed: "Upload failed",

  // Order detail page
  orderNumberPrefix: "Order #",
  itemCol: "Item",
  qtyCol: "Qty",
  lineTotalCol: "Line Total",
  placedLabel: "Placed:",
  paymentLabel: "Payment:",
  paidSuffix: "paid",
  notesLabel: "Notes:",
  paymentProofTitle: "Payment Proof",
  uploadProofHint: "Upload a screenshot of your bank transfer for confirmation.",
  proofStatusLabel: "Status:",

  // ProofUpload
  selectImageFirst: "Select an image first",
  uploading: "Uploading…",
  uploadProof: "Upload Proof",

  // ProductDetail
  inStockCount: "{count} {unit} in stock",
  passThroughAvailable: "Available to order — supplied on demand",
  addToCart: "Add to Cart",
  addedToCart: "Added!",
  yourNamePlaceholder: "Your name",
  phoneNumberPlaceholder: "Phone number",
  emailOptionalPlaceholder: "Email (optional)",
  messageOptionalPlaceholder: "Message (optional)",
  sendingInquiry: "Sending…",
  requestPrice: "Request Price",
  thanksInquiry: "Thanks! We'll contact you with a price shortly.",

  // products/[id]/actions.ts error keys
  errNamePhoneRequired: "Name and phone are required",
  errProductNotFound: "Product not found",

  // Order status labels (keyed by Prisma OrderStatus enum — do not translate the keys)
  orderStatusLabels: {
    PENDING: "Pending",
    PICKING: "Picking",
    PACKED: "Packed",
    READY: "Ready",
    DELIVERED: "Delivered",
    PICKED_UP: "Picked Up",
    CANCELLED: "Cancelled",
  },

  // Payment method labels (keyed by payment method enum — do not translate the keys)
  paymentMethodLabels: {
    COD: "Cash on Delivery",
    TRANSFER: "Bank Transfer",
  },

  // Payment proof status labels (keyed by proof status enum — do not translate the keys)
  proofStatusLabels: {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    REJECTED: "Rejected",
  },
};

const my: typeof en = {
  // StoreNav
  navShop: "စျေးဝယ်ရန်",
  navCart: "ခြင်းတောင်း",
  navSignIn: "ဝင်ရောက်ရန်",
  navWholesale: "လက်ကားရောင်း",

  // Home page
  shopByCategory: "အမျိုးအစားအလိုက် ဝယ်ယူရန်",
  allProducts: "ကုန်ပစ္စည်းအားလုံး",
  noProductsYet: "ကုန်ပစ္စည်းများ မရှိသေးပါ။",
  noProductsInCategory: "ဤအမျိုးအစားတွင် ကုန်ပစ္စည်းများ မရှိသေးပါ။",

  // ProductCard / ProductDetail shared
  contactForPrice: "ဈေးနှုန်းသိရှိရန် ဆက်သွယ်ပါ",
  inStock: "ပစ္စည်းရှိသည်",
  outOfStock: "ပစ္စည်းကုန်သွားပြီ",
  onDemand: "မှာယူနိုင်သည်",
  noImage: "ပုံမရှိပါ",

  // Cart page
  cartEmpty: "သင့်ခြင်းတောင်းထဲတွင် ပစ္စည်းမရှိသေးပါ။",
  continueShopping: "ဆက်လက်ဝယ်ယူရန်",
  yourCart: "သင့်ခြင်းတောင်း",
  subtotal: "စုစုပေါင်း",
  proceedToCheckout: "အော်ဒါတင်ရန် ဆက်သွားမည်",

  // Account page
  myAccount: "ကျွန်ုပ်၏အကောင့်",
  nameLabel: "အမည်-",
  emailLabel: "အီးမေးလ်-",
  phoneLabel: "ဖုန်းနံပါတ်-",
  addressLabel: "လိပ်စာ-",
  orderHistory: "အော်ဒါမှတ်တမ်း",
  orderCol: "အော်ဒါ",
  placedCol: "မှာယူသည့်ရက်",
  itemsCol: "ပစ္စည်းအရေအတွက်",
  totalCol: "စုစုပေါင်း",
  statusCol: "အခြေအနေ",
  noOrdersYet: "အော်ဒါများ မရှိသေးပါ။",

  // Login page
  signIn: "ဝင်ရောက်ရန်",
  emailPlaceholder: "အီးမေးလ်",
  passwordPlaceholder: "စကားဝှက်",
  signingIn: "ဝင်ရောက်နေသည်…",
  noAccount: "အကောင့်မရှိသေးဘူးလား?",
  registerLink: "အကောင့်ဖွင့်ရန်",

  // Register page
  createAccount: "အကောင့်ဖွင့်ရန်",
  fullNamePlaceholder: "အမည်အပြည့်အစုံ",
  phoneOptionalPlaceholder: "ဖုန်းနံပါတ် (ရွေးချယ်နိုင်သည်)",
  creatingAccount: "အကောင့်ဖွင့်နေသည်…",
  alreadyHaveAccount: "အကောင့်ရှိပြီးသားလား?",
  signInLink: "ဝင်ရောက်ရန်",

  // LogoutButton
  signOut: "ထွက်ရန်",

  // account/actions.ts error keys
  errNameEmailPasswordRequired: "အမည်၊ အီးမေးလ်နှင့် အနည်းဆုံး စာလုံး ၆ လုံးရှိသော စကားဝှက် လိုအပ်ပါသည်",
  errEmailExists: "ဤအီးမေးလ်ဖြင့် အကောင့်ရှိပြီးဖြစ်ပါသည်",
  errInvalidCredentials: "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်",
  errPleaseSignIn: "ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ",

  // Checkout page
  checkoutTitle: "အော်ဒါတင်ရန်",
  orderSummary: "အော်ဒါအကျဉ်းချုပ်",
  shippingPlaceholder: "ပို့ဆောင်ရန် / ယူဆောင်ရန် လိပ်စာ",
  paymentCOD: "ငွေချေရန် (ပစ္စည်းရောက်မှ)",
  paymentTransfer: "ဘဏ်ဖြင့်ငွေလွှဲခြင်း",
  notesOptionalPlaceholder: "မှတ်ချက် (ရွေးချယ်နိုင်သည်)",
  placingOrder: "အော်ဒါတင်နေသည်…",
  placeOrder: "အော်ဒါတင်ရန်",

  // checkout/actions.ts error keys
  errPleaseSignInCheckout: "အော်ဒါတင်ရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ",
  errShippingRequired: "ပို့ဆောင်ရန်လိပ်စာ လိုအပ်ပါသည်",
  errAccountNotFound: "အကောင့်ကို ရှာမတွေ့ပါ",
  errOrderNotFound: "အော်ဒါကို ရှာမတွေ့ပါ",
  errProofAlreadyConfirmed: "ဤအော်ဒါ၏ ငွေပေးချေမှုကို အတည်ပြုပြီးဖြစ်ပါသည်။ ပြောင်းလဲလိုပါက ဆက်သွယ်ပါ။",
  errSelectImage: "တင်ရန် ပုံတစ်ပုံကို ရွေးချယ်ပါ",
  errUploadFailed: "တင်ခြင်း မအောင်မြင်ပါ",

  // Order detail page
  orderNumberPrefix: "အော်ဒါ #",
  itemCol: "ပစ္စည်း",
  qtyCol: "အရေအတွက်",
  lineTotalCol: "စုစုပေါင်း",
  placedLabel: "မှာယူသည့်ရက်-",
  paymentLabel: "ငွေချေမှု-",
  paidSuffix: "ပေးချေပြီး",
  notesLabel: "မှတ်ချက်-",
  paymentProofTitle: "ငွေပေးချေမှု အထောက်အထား",
  uploadProofHint: "အတည်ပြုရန်အတွက် ဘဏ်ငွေလွှဲပြေစာ ဓာတ်ပုံကို တင်ပါ။",
  proofStatusLabel: "အခြေအနေ-",

  // ProofUpload
  selectImageFirst: "ဦးစွာ ပုံတစ်ပုံကို ရွေးချယ်ပါ",
  uploading: "တင်နေသည်…",
  uploadProof: "အထောက်အထား တင်ရန်",

  // ProductDetail
  inStockCount: "{count} {unit} ပစ္စည်းရှိသည်",
  passThroughAvailable: "မှာယူနိုင်သည် — လိုအပ်မှ ပေးပို့မည်",
  addToCart: "ခြင်းတောင်းထဲထည့်ရန်",
  addedToCart: "ထည့်ပြီးပါပြီ!",
  yourNamePlaceholder: "သင့်အမည်",
  phoneNumberPlaceholder: "ဖုန်းနံပါတ်",
  emailOptionalPlaceholder: "အီးမေးလ် (ရွေးချယ်နိုင်သည်)",
  messageOptionalPlaceholder: "မက်ဆေ့ချ် (ရွေးချယ်နိုင်သည်)",
  sendingInquiry: "ပေးပို့နေသည်…",
  requestPrice: "ဈေးနှုန်းတောင်းဆိုရန်",
  thanksInquiry: "ကျေးဇူးတင်ပါသည်! ဈေးနှုန်းနှင့်အတူ မကြာမီ ဆက်သွယ်ပါမည်။",

  // products/[id]/actions.ts error keys
  errNamePhoneRequired: "အမည်နှင့် ဖုန်းနံပါတ် လိုအပ်ပါသည်",
  errProductNotFound: "ကုန်ပစ္စည်းကို ရှာမတွေ့ပါ",

  // Order status labels (keyed by Prisma OrderStatus enum — do not translate the keys)
  orderStatusLabels: {
    PENDING: "စောင့်ဆိုင်းနေသည်",
    PICKING: "ပစ္စည်းရွေးနေသည်",
    PACKED: "ထုပ်ပိုးပြီး",
    READY: "အသင့်ဖြစ်ပြီ",
    DELIVERED: "ပို့ဆောင်ပြီး",
    PICKED_UP: "ယူဆောင်သွားပြီး",
    CANCELLED: "ပယ်ဖျက်ပြီး",
  },

  // Payment method labels (keyed by payment method enum — do not translate the keys)
  paymentMethodLabels: {
    COD: "ငွေချေရန် (ပစ္စည်းရောက်မှ)",
    TRANSFER: "ဘဏ်ဖြင့်ငွေလွှဲခြင်း",
  },

  // Payment proof status labels (keyed by proof status enum — do not translate the keys)
  proofStatusLabels: {
    PENDING: "စောင့်ဆိုင်းနေသည်",
    CONFIRMED: "အတည်ပြုပြီး",
    REJECTED: "ငြင်းပယ်ခံရသည်",
  },
};

export const storeDict = { EN: en, MY: my };
