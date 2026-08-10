const en = {
  // Layout tabs / page titles
  tabCashLedger: "Cash Ledger",
  tabPayable: "Payable",
  tabReceivable: "Receivable",
  tabExpenses: "Expenses",

  // Cash ledger page
  go: "Go",
  openingBalance: "Opening Balance",
  netForDay: "Net for the day",
  closingBalance: "Closing Balance",
  colTime: "Time",
  colDescription: "Description",
  colSource: "Source",
  colRecordedBy: "Recorded By",
  colAmount: "Amount",
  noCashEntries: "No cash entries for this date.",
  cashSourceSale: "Sale",
  cashSourceExpense: "Expense",
  cashSourceSupplierPayment: "Supplier Payment",
  cashSourceAdjustment: "Adjustment",
  cashSourceOther: "Other",

  // New manual cash entry form
  newManualEntry: "New Manual Entry",
  typeLabel: "Type",
  cashIn: "Cash In",
  cashOut: "Cash Out",
  descriptionPlaceholder: "e.g. Till float, petty cash withdrawal",
  addEntry: "Add Entry",
  errSomethingWrong: "Something went wrong",
  errInvalidEntryType: "Invalid entry type",
  errEnterValidAmount: "Enter a valid amount",
  errEnterDescription: "Enter a description",
  errInvalidDate: "Invalid date",

  // Expenses page
  expensesTitle: "Expenses",
  categoryLabel: "Category",
  allCategories: "All categories",
  fromLabel: "From",
  toLabel: "To",
  noExpenses: "No expenses found.",
  receiptLink: "Receipt",

  // Expense form
  recordExpense: "Record Expense",
  selectCategory: "Select category",
  paymentMethodLabel: "Payment Method",
  paymentMethodCash: "Cash",
  paymentMethodTransfer: "Transfer",
  supplierLabel: "Supplier (optional)",
  receiptLabel: "Receipt (optional)",
  saveExpense: "Save Expense",

  // Category manager
  categoriesTitle: "Categories",
  noCategories: "No categories yet.",
  rename: "Rename",
  deactivate: "Deactivate",
  activate: "Activate",
  newCategoryPlaceholder: "New category name",

  // Expenses actions errors
  errSelectCategory: "Select a category",
  errSelectPaymentMethod: "Select a payment method",
  errCategoryNotFound: "Category not found",
  errEnterCategoryName: "Enter a category name",
  errCategoryNameExists: "A category with this name already exists",

  // Payable page
  payableTitle: "Accounts Payable",
  colInvoice: "Invoice",
  colSupplier: "Supplier",
  colInvoiceDate: "Invoice Date",
  colAging: "Aging",
  colAction: "Action",
  noUnpaidInvoices: "No unpaid supplier invoices.",
  agingOverdue: "Overdue",
  agingDueSoon: "Due soon",
  agingCurrent: "Current",

  // Payment form
  recordPayment: "Record Payment",

  // Payable actions errors
  errInvoiceNotFound: "Invoice not found",
  errInvoiceAlreadyPaid: "This invoice is already marked paid",

  // Receivable page
  receivableTitle: "Accounts Receivable",
  receivableSubtitle: "Online orders awaiting bank transfer confirmation.",
  colOrder: "Order",
  colCustomer: "Customer",
  colUploaded: "Uploaded",
  noPendingProofs: "No pending payment proofs.",
  review: "Review",

  // Receivable detail page
  orderTitle: "Order",
  customerLabel: "Customer:",
  phoneLabel: "Phone:",
  emailLabel: "Email:",
  totalLabel: "Total:",
  proofUploadedLabel: "Proof uploaded:",
  orderItemsTitle: "Order Items",
  paymentProofTitle: "Payment Proof",
  paymentProofAlt: "Payment proof",

  // Proof review
  confirmPayment: "Confirm Payment",
  reject: "Reject",
  paymentConfirmed: "Payment confirmed.",
  paymentRejected: "Payment rejected. Customer must re-upload proof.",

  // Receivable actions errors
  errProofNotFound: "Payment proof not found",
  errProofAlreadyReviewed: "This proof has already been reviewed",
};

const my: typeof en = {
  // Layout tabs / page titles
  tabCashLedger: "ငွေသားစာရင်း",
  tabPayable: "ပေးရန်ငွေ",
  tabReceivable: "ရရန်ငွေ",
  tabExpenses: "ကုန်ကျစရိတ်",

  // Cash ledger page
  go: "သွားရန်",
  openingBalance: "အစပိုင်းလက်ကျန်ငွေ",
  netForDay: "တစ်နေ့တာ အသားတင်",
  closingBalance: "နောက်ဆုံးလက်ကျန်ငွေ",
  colTime: "အချိန်",
  colDescription: "ဖော်ပြချက်",
  colSource: "အရင်းအမြစ်",
  colRecordedBy: "မှတ်တမ်းတင်သူ",
  colAmount: "ပမာဏ",
  noCashEntries: "ဤရက်စွဲအတွက် ငွေသားမှတ်တမ်း မရှိပါ။",
  cashSourceSale: "အရောင်း",
  cashSourceExpense: "ကုန်ကျစရိတ်",
  cashSourceSupplierPayment: "ပေးသွင်းသူ ငွေပေးချေမှု",
  cashSourceAdjustment: "ချိန်ညှိမှု",
  cashSourceOther: "အခြား",

  // New manual cash entry form
  newManualEntry: "လက်ဖြင့် မှတ်တမ်းအသစ်ထည့်ရန်",
  typeLabel: "အမျိုးအစား",
  cashIn: "ငွေဝင်",
  cashOut: "ငွေထွက်",
  descriptionPlaceholder: "ဥပမာ - ငွေအိတ်အရင်းငွေ၊ လက်ငင်းငွေထုတ်ယူမှု",
  addEntry: "မှတ်တမ်းထည့်ရန်",
  errSomethingWrong: "တစ်ခုခုမှားယွင်းသွားပါသည်",
  errInvalidEntryType: "မှတ်တမ်းအမျိုးအစား မမှန်ကန်ပါ",
  errEnterValidAmount: "မှန်ကန်သော ပမာဏတစ်ခု ထည့်ပါ",
  errEnterDescription: "ဖော်ပြချက် ထည့်ပါ",
  errInvalidDate: "ရက်စွဲ မမှန်ကန်ပါ",

  // Expenses page
  expensesTitle: "ကုန်ကျစရိတ်များ",
  categoryLabel: "အမျိုးအစား",
  allCategories: "အမျိုးအစားအားလုံး",
  fromLabel: "မှ",
  toLabel: "အထိ",
  noExpenses: "ကုန်ကျစရိတ် မတွေ့ပါ။",
  receiptLink: "ပြေစာ",

  // Expense form
  recordExpense: "ကုန်ကျစရိတ် မှတ်တမ်းတင်ရန်",
  selectCategory: "အမျိုးအစား ရွေးချယ်ပါ",
  paymentMethodLabel: "ငွေပေးချေနည်း",
  paymentMethodCash: "လက်ငင်းငွေ",
  paymentMethodTransfer: "ငွေလွှဲ",
  supplierLabel: "ပေးသွင်းသူ (ရွေးချယ်နိုင်)",
  receiptLabel: "ပြေစာ (ရွေးချယ်နိုင်)",
  saveExpense: "ကုန်ကျစရိတ် သိမ်းရန်",

  // Category manager
  categoriesTitle: "အမျိုးအစားများ",
  noCategories: "အမျိုးအစား မရှိသေးပါ။",
  rename: "အမည်ပြောင်းရန်",
  deactivate: "ရပ်ဆိုင်းရန်",
  activate: "အသုံးပြုရန်",
  newCategoryPlaceholder: "အမျိုးအစားအသစ်၏ အမည်",

  // Expenses actions errors
  errSelectCategory: "အမျိုးအစား ရွေးချယ်ပါ",
  errSelectPaymentMethod: "ငွေပေးချေနည်း ရွေးချယ်ပါ",
  errCategoryNotFound: "အမျိုးအစား မတွေ့ပါ",
  errEnterCategoryName: "အမျိုးအစား အမည် ထည့်ပါ",
  errCategoryNameExists: "ဤအမည်ဖြင့် အမျိုးအစားရှိပြီးဖြစ်သည်",

  // Payable page
  payableTitle: "ပေးရန်ငွေစာရင်း",
  colInvoice: "ငွေတောင်းခံလွှာ",
  colSupplier: "ပေးသွင်းသူ",
  colInvoiceDate: "ငွေတောင်းခံလွှာရက်စွဲ",
  colAging: "ကြာချိန်",
  colAction: "လုပ်ဆောင်ချက်",
  noUnpaidInvoices: "မပေးရသေးသော ပေးသွင်းသူ ငွေတောင်းခံလွှာ မရှိပါ။",
  agingOverdue: "သတ်မှတ်ရက်လွန်",
  agingDueSoon: "မကြာမီ ပေးရမည်",
  agingCurrent: "သတ်မှတ်ရက်အတွင်း",

  // Payment form
  recordPayment: "ငွေပေးချေမှု မှတ်တမ်းတင်ရန်",

  // Payable actions errors
  errInvoiceNotFound: "ငွေတောင်းခံလွှာ မတွေ့ပါ",
  errInvoiceAlreadyPaid: "ဤငွေတောင်းခံလွှာကို ပေးချေပြီးဖြစ်ကြောင်း မှတ်သားထားပါသည်",

  // Receivable page
  receivableTitle: "ရရန်ငွေစာရင်း",
  receivableSubtitle: "ဘဏ်ငွေလွှဲ အတည်ပြုချက် စောင့်ဆိုင်းနေသော အွန်လိုင်းအော်ဒါများ။",
  colOrder: "အော်ဒါ",
  colCustomer: "ဖောက်သည်",
  colUploaded: "တင်ချိန်",
  noPendingProofs: "စောင့်ဆိုင်းနေသော ငွေပေးချေမှုအထောက်အထား မရှိပါ။",
  review: "စစ်ဆေးရန်",

  // Receivable detail page
  orderTitle: "အော်ဒါ",
  customerLabel: "ဖောက်သည်:",
  phoneLabel: "ဖုန်း:",
  emailLabel: "အီးမေးလ်:",
  totalLabel: "စုစုပေါင်း:",
  proofUploadedLabel: "အထောက်အထား တင်ချိန်:",
  orderItemsTitle: "အော်ဒါပစ္စည်းများ",
  paymentProofTitle: "ငွေပေးချေမှုအထောက်အထား",
  paymentProofAlt: "ငွေပေးချေမှုအထောက်အထား",

  // Proof review
  confirmPayment: "ငွေပေးချေမှု အတည်ပြုရန်",
  reject: "ငြင်းပယ်ရန်",
  paymentConfirmed: "ငွေပေးချေမှု အတည်ပြုပြီးပါပြီ။",
  paymentRejected: "ငွေပေးချေမှု ငြင်းပယ်ခံရပါသည်။ ဖောက်သည်သည် အထောက်အထားကို ပြန်လည်တင်ရန် လိုအပ်ပါသည်။",

  // Receivable actions errors
  errProofNotFound: "ငွေပေးချေမှုအထောက်အထား မတွေ့ပါ",
  errProofAlreadyReviewed: "ဤအထောက်အထားကို စစ်ဆေးပြီးဖြစ်ပါသည်",
};

export const accountingDict = { EN: en, MY: my };
