const en = {
  // Layout tabs
  tabPL: "P&L",
  tabSales: "Sales",
  tabInventory: "Inventory",
  tabPayroll: "Payroll",
  tabJournal: "Journal",

  // Shared filter labels
  fromLabel: "From",
  toLabel: "To",

  // P&L report
  plTitle: "Profit & Loss",
  summaryTitle: "Summary",
  revenueNetSales: "Revenue (net sales)",
  cogs: "COGS",
  grossProfit: "Gross Profit",
  expenses: "Expenses",
  payrollCost: "Payroll Cost",
  operatingCost: "Operating Cost",
  netProfit: "Net Profit",
  revenueByCategory: "Revenue by Category",
  revenueByCategoryNote:
    'Pre-discount (unit price × qty) — won\'t match "Revenue (net sales)" above when order-level discounts apply.',
  noSalesInPeriod: "No sales in this period.",
  expensesByCategory: "Expenses by Category",
  noExpensesInPeriod: "No expenses in this period.",

  // Sales report
  salesReportTitle: "Sales Report",
  revenue: "Revenue",
  orders: "Orders",
  avgOrderValue: "Avg Order Value",
  revenueByDay: "Revenue by Day",
  colCategory: "Category",
  colQty: "Qty",
  topSellers: "Top Sellers",
  colProduct: "Product",
  colSku: "SKU",
  colQtySold: "Qty Sold",

  // Inventory report
  inventoryReportTitle: "Inventory Report",
  skusTracked: "SKUs Tracked",
  totalUnitsInStock: "Total Units in Stock",
  lowStockAlerts: "Low Stock Alerts",
  lowStockTitle: "Low Stock",
  colStock: "Stock",
  colThreshold: "Threshold",
  stockByProductLocation: "Stock by Product / Location",
  colLocations: "Locations",
  noRegularProducts: "No REGULAR products found.",
  lowBadge: "Low",

  // Payroll report
  payrollReportTitle: "Payroll Report",
  monthLabel: "Month",
  go: "Go",
  headcount: "Headcount",
  totalBasicSalary: "Total Basic Salary",
  totalNetPay: "Total Net Pay",
  netPayByEmployee: "Net Pay by Employee",
  colEmployee: "Employee",
  colBasic: "Basic",
  colNetPay: "Net Pay",
  noPayrollForMonth: "No payroll generated for this month.",
  payrollCostByMonth: "Payroll Cost by Month",
  colPeriod: "Period",
  noPayrollsYet: "No payrolls yet.",

  // Journal report
  journalTitle: "General Journal",
  exportExcel: "Export Excel",
  noEntriesInPeriod: "No journal entries in this period.",
  dailyInsOuts: "Daily ins & outs",
  colIn: "In",
  colOut: "Out",
  colNet: "Net",
  colBalance: "Balance",
  balanceCarriedOver: "Balance carried over:",
  totalDebit: "Total Debit",
  totalCredit: "Total Credit",
  balanced: "Balanced ✓",
  unbalanced: "⚠ Unbalanced — investigate",
};

const my: typeof en = {
  // Layout tabs
  tabPL: "အမြတ်/အရှုံး",
  tabSales: "အရောင်း",
  tabInventory: "ကုန်ပစ္စည်းစာရင်း",
  tabPayroll: "လစာစာရင်း",
  tabJournal: "ဂျာနယ်",

  // Shared filter labels
  fromLabel: "မှ",
  toLabel: "အထိ",

  // P&L report
  plTitle: "အမြတ်/အရှုံးစာရင်း",
  summaryTitle: "အနှစ်ချုပ်",
  revenueNetSales: "ဝင်ငွေ (အသားတင်အရောင်း)",
  cogs: "ကုန်ပစ္စည်းကုန်ကျစရိတ်",
  grossProfit: "စုစုပေါင်းအမြတ်",
  expenses: "ကုန်ကျစရိတ်များ",
  payrollCost: "လုပ်ခလစာကုန်ကျစရိတ်",
  operatingCost: "လည်ပတ်မှုကုန်ကျစရိတ်",
  netProfit: "အသားတင်အမြတ်",
  revenueByCategory: "အမျိုးအစားအလိုက် ဝင်ငွေ",
  revenueByCategoryNote:
    "လျှော့စျေးမပါမီ (ယူနစ်ဈေး × အရေအတွက်) — အော်ဒါအဆင့် လျှော့စျေးရှိပါက အထက်ပါ \"ဝင်ငွေ (အသားတင်အရောင်း)\" နှင့် မကိုက်ညီနိုင်ပါ။",
  noSalesInPeriod: "ဤကာလအတွင်း အရောင်း မရှိပါ။",
  expensesByCategory: "အမျိုးအစားအလိုက် ကုန်ကျစရိတ်",
  noExpensesInPeriod: "ဤကာလအတွင်း ကုန်ကျစရိတ် မရှိပါ။",

  // Sales report
  salesReportTitle: "အရောင်းအစီရင်ခံစာ",
  revenue: "ဝင်ငွေ",
  orders: "အော်ဒါများ",
  avgOrderValue: "ပျမ်းမျှအော်ဒါတန်ဖိုး",
  revenueByDay: "နေ့အလိုက် ဝင်ငွေ",
  colCategory: "အမျိုးအစား",
  colQty: "အရေအတွက်",
  topSellers: "အရောင်းရဆုံးပစ္စည်းများ",
  colProduct: "ပစ္စည်း",
  colSku: "SKU",
  colQtySold: "ရောင်းရအရေအတွက်",

  // Inventory report
  inventoryReportTitle: "ကုန်ပစ္စည်းစာရင်း အစီရင်ခံစာ",
  skusTracked: "စောင့်ကြည့်နေသော SKU အရေအတွက်",
  totalUnitsInStock: "လက်ကျန်ပစ္စည်း စုစုပေါင်း",
  lowStockAlerts: "ပစ္စည်းနည်းပါးမှု သတိပေးချက်များ",
  lowStockTitle: "ပစ္စည်းနည်းပါးနေသည်",
  colStock: "လက်ကျန်",
  colThreshold: "သတ်မှတ်ချက်",
  stockByProductLocation: "ပစ္စည်း/တည်နေရာအလိုက် လက်ကျန်",
  colLocations: "တည်နေရာများ",
  noRegularProducts: "REGULAR ပစ္စည်း မတွေ့ပါ။",
  lowBadge: "နည်းနေသည်",

  // Payroll report
  payrollReportTitle: "လစာအစီရင်ခံစာ",
  monthLabel: "လ",
  go: "သွားရန်",
  headcount: "ဝန်ထမ်းအရေအတွက်",
  totalBasicSalary: "အခြေခံလစာ စုစုပေါင်း",
  totalNetPay: "အသားတင်လစာ စုစုပေါင်း",
  netPayByEmployee: "ဝန်ထမ်းအလိုက် အသားတင်လစာ",
  colEmployee: "ဝန်ထမ်း",
  colBasic: "အခြေခံလစာ",
  colNetPay: "အသားတင်လစာ",
  noPayrollForMonth: "ဤလအတွက် လစာစာရင်း မထုတ်ရသေးပါ။",
  payrollCostByMonth: "လအလိုက် လစာကုန်ကျစရိတ်",
  colPeriod: "ကာလ",
  noPayrollsYet: "လစာစာရင်း မရှိသေးပါ။",

  // Journal report
  journalTitle: "အထွေထွေဂျာနယ်",
  exportExcel: "Excel ထုတ်ယူရန်",
  noEntriesInPeriod: "ဤကာလအတွင်း ဂျာနယ်မှတ်တမ်း မရှိပါ။",
  dailyInsOuts: "နေ့စဉ် ဝင်/ထွက်ငွေ",
  colIn: "ဝင်",
  colOut: "ထွက်",
  colNet: "အသားတင်",
  colBalance: "လက်ကျန်",
  balanceCarriedOver: "ရွေ့ယူထားသည့် လက်ကျန်ငွေ:",
  totalDebit: "ဒက်ဘစ် စုစုပေါင်း",
  totalCredit: "ခရက်ဒစ် စုစုပေါင်း",
  balanced: "ချိန်ညှိပြီး ✓",
  unbalanced: "⚠ မညီမျှပါ — စစ်ဆေးရန်",
};

export const reportsDict = { EN: en, MY: my };
