const en = {
  // Layout tabs
  tabIncomingInvoices: "Incoming Invoices",
  tabFulfilment: "Fulfilment",
  tabStock: "Stock",

  // Stock overview
  lowStockAlertsTitle: "Low Stock Alerts",
  colProduct: "Product",
  colSku: "SKU",
  colStock: "Stock",
  colThreshold: "Threshold",
  stockOverviewTitle: "Stock Overview",
  colVariant: "Variant",
  colTotalStock: "Total Stock",
  colByLocation: "By Location",
  noProductVariantsYet: "No product variants yet.",

  // Order fulfilment list
  orderFulfilmentTitle: "Order Fulfilment",
  colOrder: "Order",
  colCustomer: "Customer",
  colChannel: "Channel",
  colItems: "Items",
  colPlaced: "Placed",
  noOrdersAwaitingFulfilment: "No orders awaiting fulfilment.",
  walkIn: "Walk-in",
  openLink: "Open",

  // Order statuses
  statusPending: "Pending",
  statusPicking: "Picking",
  statusPacked: "Packed",
  statusReady: "Ready",
  statusDelivered: "Delivered",
  statusPickedUp: "Picked Up",
  statusCancelled: "Cancelled",

  // Order detail / picking
  orderTitlePrefix: "Order #",
  walkInCustomer: "Walk-in customer",
  activityTitle: "Activity",
  systemActor: "System",
  colItem: "Item",
  colQty: "Qty",
  colLocations: "Location(s)",
  supplierOrderRequired: "Supplier Order Required",
  itemStatusPending: "Pending",
  itemStatusPicked: "Picked",
  itemStatusUnavailable: "Unavailable",
  confirmPickedBtn: "Confirm Picked",
  unavailableBtn: "Unavailable",
  markPackedBtn: "Mark Packed",
  markReadyBtn: "Mark Ready",
  pickedUpByCustomerBtn: "Picked Up by Customer",
  deliveredBtn: "Delivered",
  genericError: "Something went wrong",

  // Invoices list
  pendingInvoicesTitle: "Pending Invoices",
  noInvoicesWaitingForCounting: "No invoices waiting for counting.",
  recentlyPlacedTitle: "Recently Placed",
  noInvoicesPlacedYet: "No invoices placed yet.",
  colSupplier: "Supplier",
  colInvoiceNo: "Invoice No.",

  invoiceStatusSubmitted: "Submitted",
  invoiceStatusCounting: "Counting",
  invoiceStatusPlaced: "Placed",
  invoiceStatusComplete: "Complete",

  // Counting detail
  supplierInvoiceFallback: "Supplier Invoice",
  unmappedItemFallback: "Unmapped item",
  confirmPlacementConfirm:
    "Confirm placement? This will add counted quantities to stock at the assigned locations.",
  colInvoicedQty: "Invoiced Qty",
  colCountAndLocation: "Count & Location",
  colCounted: "Counted",
  colPlacedQty: "Placed",
  colUnitCost: "Unit Cost",
  locationPlaceholderOption: "— Location —",
  placingLabel: "Placing…",
  confirmPlacementBtn: "Confirm Placement",
  submittedByLabel: "Submitted by",
  countedByLabel: "Counted by",

  // orders/actions.ts errors
  errOrderItemNotFound: "Order item not found",
  errItemAlreadyProcessed: "This item has already been processed",
  errOrderNotOpenForPicking: "This order is not open for picking",
  errOrderNotFound: "Order not found",
  errOrderCannotBeCancelled: "This order can no longer be cancelled",
  errOrderMustBeFullyPicked: "Order must be fully picked first",
  errEveryItemMustBeResolved: "Every item must be picked or marked unavailable first",
  errOrderMustBePacked: "Order must be packed first",
  errOrderMustBeReady: "Order must be ready first",

  // invoices/actions.ts errors
  errLineItemNotFound: "Line item not found",
  errInvoiceNotOpenForCounting: "This invoice is no longer open for counting",
  errCountedQtyInvalid: "Counted quantity must be a non-negative whole number",
  errInvoiceNotFound: "Invoice not found",
  errInvoiceMustBeCounting: "Invoice must be in Counting status before it can be placed",
  errEveryItemMustHaveCount: "Every line item must have a counted quantity",
  errAssignLocationToEveryItem: "Assign a warehouse location to every counted item",

  // Supplier invoice activity log actions
  logActionCreated: "created the invoice",
  logActionCashierSubmitted: "submitted for warehouse counting",
  logActionCounting: "started counting",
  logActionPlaced: "confirmed placement",
};

const my: typeof en = {
  // Layout tabs
  tabIncomingInvoices: "ဝင်ပြေစာများ",
  tabFulfilment: "အော်ဒါဖြည့်ဆည်းခြင်း",
  tabStock: "လက်ကျန်ပစ္စည်း",

  // Stock overview
  lowStockAlertsTitle: "လက်ကျန်နည်းနေသော သတိပေးချက်များ",
  colProduct: "ကုန်ပစ္စည်း",
  colSku: "SKU",
  colStock: "လက်ကျန်",
  colThreshold: "အနိမ့်ဆုံးသတ်မှတ်ချက်",
  stockOverviewTitle: "လက်ကျန်ပစ္စည်း ခြုံငုံသုံးသပ်ချက်",
  colVariant: "Variant",
  colTotalStock: "စုစုပေါင်းလက်ကျန်",
  colByLocation: "တည်နေရာအလိုက်",
  noProductVariantsYet: "ကုန်ပစ္စည်း Variant မရှိသေးပါ။",

  // Order fulfilment list
  orderFulfilmentTitle: "အော်ဒါဖြည့်ဆည်းခြင်း",
  colOrder: "အော်ဒါ",
  colCustomer: "ဖောက်သည်",
  colChannel: "လမ်းကြောင်း",
  colItems: "ပစ္စည်းအရေအတွက်",
  colPlaced: "အော်ဒါတင်ချိန်",
  noOrdersAwaitingFulfilment: "ဖြည့်ဆည်းရန် အော်ဒါ မရှိပါ။",
  walkIn: "လာရောက်ဝယ်ယူသူ",
  openLink: "ဖွင့်ရန်",

  // Order statuses
  statusPending: "ဆိုင်းငံ့ထား",
  statusPicking: "ကောက်ယူနေသည်",
  statusPacked: "ထုပ်ပိုးပြီး",
  statusReady: "အသင့်ဖြစ်ပြီး",
  statusDelivered: "ပို့ဆောင်ပြီး",
  statusPickedUp: "လာယူပြီး",
  statusCancelled: "ပယ်ဖျက်ပြီး",

  // Order detail / picking
  orderTitlePrefix: "အော်ဒါ #",
  walkInCustomer: "လာရောက်ဝယ်ယူသူ",
  activityTitle: "လုပ်ဆောင်ချက်မှတ်တမ်း",
  systemActor: "စနစ်",
  colItem: "ပစ္စည်း",
  colQty: "အရေအတွက်",
  colLocations: "တည်နေရာ(များ)",
  supplierOrderRequired: "ပေးသွင်းသူထံ မှာယူရန်လိုအပ်သည်",
  itemStatusPending: "ဆိုင်းငံ့ထား",
  itemStatusPicked: "ကောက်ယူပြီး",
  itemStatusUnavailable: "မရရှိနိုင်ပါ",
  confirmPickedBtn: "ကောက်ယူပြီးကြောင်း အတည်ပြုရန်",
  unavailableBtn: "မရရှိနိုင်ပါ",
  markPackedBtn: "ထုပ်ပိုးပြီးဟု မှတ်သားရန်",
  markReadyBtn: "အသင့်ဖြစ်ပြီဟု မှတ်သားရန်",
  pickedUpByCustomerBtn: "ဖောက်သည်လာယူသွားပြီး",
  deliveredBtn: "ပို့ဆောင်ပြီး",
  genericError: "တစ်ခုခုမှားယွင်းသွားပါသည်",

  // Invoices list
  pendingInvoicesTitle: "ဆိုင်းငံ့ထားသော ပြေစာများ",
  noInvoicesWaitingForCounting: "ရေတွက်ရန် စောင့်ဆိုင်းနေသော ပြေစာ မရှိပါ။",
  recentlyPlacedTitle: "လတ်တလော နေရာချထားပြီးသည်များ",
  noInvoicesPlacedYet: "နေရာချထားပြီးသော ပြေစာ မရှိသေးပါ။",
  colSupplier: "ပေးသွင်းသူ",
  colInvoiceNo: "ပြေစာအမှတ်",

  invoiceStatusSubmitted: "တင်သွင်းပြီး",
  invoiceStatusCounting: "ရေတွက်နေသည်",
  invoiceStatusPlaced: "နေရာချထားပြီး",
  invoiceStatusComplete: "ပြီးစီး",

  // Counting detail
  supplierInvoiceFallback: "ပေးသွင်းသူပြေစာ",
  unmappedItemFallback: "ကိုက်ညီမှုမရှိသေးသော ပစ္စည်း",
  confirmPlacementConfirm:
    "နေရာချထားမှုကို အတည်ပြုမည်လား? ရေတွက်ထားသော အရေအတွက်များကို သတ်မှတ်တည်နေရာများသို့ လက်ကျန်အဖြစ် ထည့်သွင်းပါမည်။",
  colInvoicedQty: "ပြေစာအရေအတွက်",
  colCountAndLocation: "ရေတွက်ခြင်း နှင့် တည်နေရာ",
  colCounted: "ရေတွက်ပြီး",
  colPlacedQty: "ထားရှိပြီး",
  colUnitCost: "ယူနစ်ဈေးနှုန်း",
  locationPlaceholderOption: "— တည်နေရာ —",
  placingLabel: "နေရာချနေသည်…",
  confirmPlacementBtn: "နေရာချထားမှု အတည်ပြုရန်",
  submittedByLabel: "တင်သွင်းသူ",
  countedByLabel: "ရေတွက်သူ",

  // orders/actions.ts errors
  errOrderItemNotFound: "အော်ဒါပစ္စည်း မတွေ့ပါ",
  errItemAlreadyProcessed: "ဤပစ္စည်းကို ဆောင်ရွက်ပြီးဖြစ်သည်",
  errOrderNotOpenForPicking: "ဤအော်ဒါသည် ကောက်ယူရန် ဖွင့်မထားပါ",
  errOrderNotFound: "အော်ဒါ မတွေ့ပါ",
  errOrderCannotBeCancelled: "ဤအော်ဒါကို နောက်ထပ် ပယ်ဖျက်၍ မရတော့ပါ",
  errOrderMustBeFullyPicked: "အော်ဒါကို အရင်ဆုံး အပြည့်အဝ ကောက်ယူရမည်",
  errEveryItemMustBeResolved: "ပစ္စည်းတိုင်းကို ကောက်ယူပြီး သို့မဟုတ် မရရှိနိုင်ဟု မှတ်သားပြီးဖြစ်ရမည်",
  errOrderMustBePacked: "အော်ဒါကို အရင်ဆုံး ထုပ်ပိုးရမည်",
  errOrderMustBeReady: "အော်ဒါကို အရင်ဆုံး အသင့်ဖြစ်ပြီဟု မှတ်သားရမည်",

  // invoices/actions.ts errors
  errLineItemNotFound: "စာရင်းအကြောင်းအရာ မတွေ့ပါ",
  errInvoiceNotOpenForCounting: "ဤပြေစာသည် ရေတွက်ခြင်းအတွက် ဖွင့်မထားတော့ပါ",
  errCountedQtyInvalid: "ရေတွက်ထားသောအရေအတွက်သည် အနုတ်မဟုတ်သော ကိန်းပြည့်ဖြစ်ရမည်",
  errInvoiceNotFound: "ပြေစာ မတွေ့ပါ",
  errInvoiceMustBeCounting: "နေရာမချမီ ပြေစာသည် ရေတွက်နေဆဲ အခြေအနေတွင် ရှိရမည်",
  errEveryItemMustHaveCount: "စာရင်းအကြောင်းအရာတိုင်းတွင် ရေတွက်ထားသောအရေအတွက် ရှိရမည်",
  errAssignLocationToEveryItem: "ရေတွက်ထားသော ပစ္စည်းတိုင်းကို ဂိုဒေါင်တည်နေရာ သတ်မှတ်ပေးပါ",

  // Supplier invoice activity log actions
  logActionCreated: "ပြေစာဖန်တီးခဲ့သည်",
  logActionCashierSubmitted: "ဂိုဒေါင်ရေတွက်ခြင်းအတွက် တင်သွင်းခဲ့သည်",
  logActionCounting: "ရေတွက်ခြင်း စတင်ခဲ့သည်",
  logActionPlaced: "နေရာချထားမှု အတည်ပြုခဲ့သည်",
};

export const warehouseDict = { EN: en, MY: my };
