const en = {
  // layout tabs
  tabPipeline: "Pipeline",
  tabDashboard: "Dashboard",
  tabCustomers: "Customers",

  // stage labels (Lead.stage enum: NEW, CONTACTED, TO_RETURN, TO_ONBOARD, WON, LOST)
  stageNew: "New Lead",
  stageContacted: "Contacted",
  stageToReturn: "To Return",
  stageToOnboard: "To Onboard",
  stageWon: "Won",
  stageLost: "Lost",

  // activity type labels (LeadActivity.type enum: CALL, MEETING, NOTE, EMAIL, TASK)
  activityCall: "Call",
  activityMeeting: "Meeting",
  activityNote: "Note",
  activityEmail: "Email",
  activityTask: "Task",

  // Board.tsx
  pipelineTitle: "Pipeline",
  newLeadBtn: "+ New Lead",
  unassigned: "Unassigned",
  assignToPlaceholder: "Assign to…",

  // LeadCard.tsx
  staleTooltipPrefix: "No activity in",
  daySuffixShort: "d",

  // customers/page.tsx
  b2bCustomersTitle: "B2B Customers",
  colName: "Name",
  colPhone: "Phone",
  colAddress: "Address",
  colSourceLead: "Source Lead",
  colStatus: "Status",
  colPortalAccess: "Portal Access",
  noCustomersYet: "No B2B customers yet.",

  // dashboard/page.tsx
  dashboardTitle: "Dashboard",
  statTotalLeads: "Total Leads",
  statWinRate: "Win Rate",
  funnelTitle: "Funnel",
  byRepTitle: "By Rep",
  colRep: "Rep",
  colOpen: "Open",
  colWon: "Won",
  colLost: "Lost",
  staleLeadsTitle: "⏰ Stale Leads (7+ days idle)",
  noStaleLeads: "Nothing stale — nice work.",

  // LeadFormSheet.tsx
  newLeadTitle: "New Lead",
  businessNamePlaceholder: "Business name *",
  contactPersonPlaceholder: "Contact person",
  phonePlaceholder: "Phone",
  shopFieldPlaceholder: "Shop field (e.g. Restaurant)",
  townshipPlaceholder: "Township",
  cityPlaceholder: "City",
  mapsLinkPlaceholder: "Google Maps link",
  notePlaceholder: "Note",
  photoHint: "A shop photo can be added after the lead is created, from its detail view.",
  businessNameRequiredError: "Business name is required",
  createLeadBtn: "Create Lead",
  creatingEllipsis: "Creating…",

  // LeadDetailSheet.tsx
  leadModalFallbackTitle: "Lead",
  loadingEllipsis: "Loading…",
  ownerLabelPrefix: "Owner:",
  saveBtn: "Save",
  moveToPrefix: "Move to",
  jumpToStagePlaceholder: "Jump to stage…",
  lostReasonTitle: "Lost reason",
  markAsLostTitle: "Mark as Lost",
  reasonRequiredPlaceholder: "Reason (required)",
  markLostBtn: "Mark Lost",
  convertedMessagePrefix: "🎉 Converted to a B2B customer — see the",
  customersTabLinkText: "Customers",
  convertedMessageSuffix: "tab.",
  wonMessage: "🎉 Won — create the B2B customer record.",
  convertToCustomerBtn: "Convert to B2B Customer",
  ownerFieldLabel: "Owner",
  activityTitle: "Activity",
  deleteLeadConfirmText: "Delete this lead and all its activity? This can't be undone.",
  confirmDeleteBtn: "Confirm delete",
  deletingEllipsis: "Deleting…",
  deleteLeadLink: "Delete lead",
  googleMapLinkText: "🗺️ Google Map",
  replaceBtn: "Replace",
  addPhotoBtn: "Add photo",
  uploadingEllipsis: "Uploading…",

  // ActivityTimeline.tsx
  taskContentPlaceholder: "What needs to be done?",
  noteContentPlaceholder: "What happened?",
  logBtn: "Log",
  savingEllipsis: "Saving…",
  noActivityYet: "No activity yet.",
  dueLabel: "due",
  doneLabel: "done",

  // IssuePortalAccessForm.tsx
  portalAccessIssued: "Portal access issued",
  issuePortalAccessBtn: "Issue portal access",
  emailPlaceholder: "Email",
  passwordPlaceholder: "Password",

  // actions.ts error keys
  errNotSignedIn: "Not signed in",
  errNotAuthorized: "Not authorized",
  errNotAuthorizedModifyLead: "Not authorized to modify this lead",
  errLeadNotFound: "Lead not found",
  errOnlyLeadsManagersReassign: "Only leads/managers/admins can reassign leads",
  errLostReasonRequired: "Lost reason is required",
  errFailedToCreateLead: "Failed to create lead",
  errUpdateFailed: "Update failed",
  errFailedToLogActivity: "Failed to log activity",
  errDeleteFailed: "Delete failed",
  errNoFileProvided: "No file provided",
  errUploadFailed: "Upload failed",
  errLeadMustBeWon: "Lead must be WON to convert",
  errAlreadyConverted: "Already converted",
  errConversionFailed: "Conversion failed",
  errCustomerNotFound: "Customer not found",
  errCustomerAlreadyHasPortalAccess: "This customer already has portal access",
  errAccountAlreadyExists: "An account with this email already exists",
  errFailedToIssuePortalAccess: "Failed to issue portal access",
};

const my: typeof en = {
  // layout tabs
  tabPipeline: "ရောင်းချမှုလမ်းကြောင်း",
  tabDashboard: "ဒက်ရှ်ဘုတ်",
  tabCustomers: "ဖောက်သည်များ",

  // stage labels
  stageNew: "ဖောက်သည်အသစ်",
  stageContacted: "ဆက်သွယ်ပြီး",
  stageToReturn: "ပြန်ဆက်သွယ်ရန်",
  stageToOnboard: "စတင်ချိတ်ဆက်ရန်",
  stageWon: "အောင်မြင်ပြီး",
  stageLost: "လက်လွတ်ပြီး",

  // activity type labels
  activityCall: "ဖုန်းခေါ်",
  activityMeeting: "တွေ့ဆုံခြင်း",
  activityNote: "မှတ်ချက်",
  activityEmail: "အီးမေးလ်",
  activityTask: "လုပ်ဆောင်ရန်",

  // Board.tsx
  pipelineTitle: "ရောင်းချမှုလမ်းကြောင်း",
  newLeadBtn: "+ ဖောက်သည်အသစ်",
  unassigned: "တာဝန်မပေးရသေး",
  assignToPlaceholder: "တာဝန်ပေးမည့်သူ…",

  // LeadCard.tsx
  staleTooltipPrefix: "လုပ်ဆောင်ချက် မရှိသည်မှာ",
  daySuffixShort: "ရက်",

  // customers/page.tsx
  b2bCustomersTitle: "စီးပွားရေးလုပ်ငန်းချင်း ဖောက်သည်များ",
  colName: "အမည်",
  colPhone: "ဖုန်းနံပါတ်",
  colAddress: "လိပ်စာ",
  colSourceLead: "မူလဖောက်သည်လမ်းကြောင်း",
  colStatus: "အခြေအနေ",
  colPortalAccess: "ပေါ်တယ်ဝင်ရောက်ခွင့်",
  noCustomersYet: "စီးပွားရေးလုပ်ငန်းချင်း ဖောက်သည် မရှိသေးပါ။",

  // dashboard/page.tsx
  dashboardTitle: "ဒက်ရှ်ဘုတ်",
  statTotalLeads: "ဖောက်သည်လမ်းကြောင်း စုစုပေါင်း",
  statWinRate: "အောင်မြင်နှုန်း",
  funnelTitle: "ရောင်းချမှုအဆင့်ဆင့်",
  byRepTitle: "ကိုယ်စားလှယ်အလိုက်",
  colRep: "ကိုယ်စားလှယ်",
  colOpen: "လုပ်ဆောင်ဆဲ",
  colWon: "အောင်မြင်",
  colLost: "လက်လွတ်",
  staleLeadsTitle: "⏰ ရက်(၇)ကျော် ဆက်သွယ်မှုမရှိသော ဖောက်သည်များ",
  noStaleLeads: "ဆက်သွယ်မှုမရှိသည့် ဖောက်သည် မရှိပါ — အလုပ်ကောင်းပါတယ်။",

  // LeadFormSheet.tsx
  newLeadTitle: "ဖောက်သည်အသစ်",
  businessNamePlaceholder: "စီးပွားရေးလုပ်ငန်းအမည် *",
  contactPersonPlaceholder: "ဆက်သွယ်ရမည့်သူ",
  phonePlaceholder: "ဖုန်းနံပါတ်",
  shopFieldPlaceholder: "လုပ်ငန်းအမျိုးအစား (ဥပမာ - စားသောက်ဆိုင်)",
  townshipPlaceholder: "မြို့နယ်",
  cityPlaceholder: "မြို့",
  mapsLinkPlaceholder: "Google Maps လင့်ခ်",
  notePlaceholder: "မှတ်ချက်",
  photoHint: "ဆိုင်ဓာတ်ပုံကို ဖောက်သည်လမ်းကြောင်း ဖန်တီးပြီးနောက် အသေးစိတ်စာမျက်နှာမှ ထည့်နိုင်ပါသည်။",
  businessNameRequiredError: "စီးပွားရေးလုပ်ငန်းအမည် လိုအပ်ပါသည်",
  createLeadBtn: "ဖောက်သည်လမ်းကြောင်း ဖန်တီးရန်",
  creatingEllipsis: "ဖန်တီးနေသည်…",

  // LeadDetailSheet.tsx
  leadModalFallbackTitle: "ဖောက်သည်လမ်းကြောင်း",
  loadingEllipsis: "ဖွင့်နေသည်…",
  ownerLabelPrefix: "တာဝန်ခံ –",
  saveBtn: "သိမ်းရန်",
  moveToPrefix: "ရွှေ့ရန်",
  jumpToStagePlaceholder: "အဆင့်သို့ ကျော်ရန်…",
  lostReasonTitle: "လက်လွတ်ရသည့်အကြောင်းရင်း",
  markAsLostTitle: "လက်လွတ်ဟု မှတ်သားရန်",
  reasonRequiredPlaceholder: "အကြောင်းရင်း (လိုအပ်သည်)",
  markLostBtn: "လက်လွတ်ဟု မှတ်သားရန်",
  convertedMessagePrefix: "🎉 စီးပွားရေးလုပ်ငန်းချင်း ဖောက်သည်အဖြစ် ပြောင်းလဲပြီးဖြစ်သည် — ",
  customersTabLinkText: "ဖောက်သည်များ",
  convertedMessageSuffix: "တဘ်တွင် ကြည့်ပါ။",
  wonMessage: "🎉 အောင်မြင်ပြီး — စီးပွားရေးလုပ်ငန်းချင်း ဖောက်သည်မှတ်တမ်း ဖန်တီးပါ။",
  convertToCustomerBtn: "စီးပွားရေးလုပ်ငန်းချင်း ဖောက်သည်အဖြစ် ပြောင်းရန်",
  ownerFieldLabel: "တာဝန်ခံ",
  activityTitle: "လုပ်ဆောင်ချက်များ",
  deleteLeadConfirmText: "ဤဖောက်သည်လမ်းကြောင်းနှင့် လုပ်ဆောင်ချက်အားလုံးကို ဖျက်မည်လား။ ပြန်လည်ပြင်ဆင်၍ မရတော့ပါ။",
  confirmDeleteBtn: "ဖျက်ရန် အတည်ပြုမည်",
  deletingEllipsis: "ဖျက်နေသည်…",
  deleteLeadLink: "ဖောက်သည်လမ်းကြောင်း ဖျက်ရန်",
  googleMapLinkText: "🗺️ Google Map",
  replaceBtn: "အစားထိုးရန်",
  addPhotoBtn: "ဓာတ်ပုံထည့်ရန်",
  uploadingEllipsis: "တင်နေသည်…",

  // ActivityTimeline.tsx
  taskContentPlaceholder: "ဘာလုပ်ဆောင်ရန် လိုအပ်သလဲ?",
  noteContentPlaceholder: "ဘာဖြစ်ခဲ့သလဲ?",
  logBtn: "မှတ်တမ်းတင်ရန်",
  savingEllipsis: "သိမ်းနေသည်…",
  noActivityYet: "လုပ်ဆောင်ချက် မရှိသေးပါ။",
  dueLabel: "သတ်မှတ်ရက်",
  doneLabel: "ပြီးစီး",

  // IssuePortalAccessForm.tsx
  portalAccessIssued: "ပေါ်တယ်ဝင်ရောက်ခွင့် ထုတ်ပေးပြီးပါပြီ",
  issuePortalAccessBtn: "ပေါ်တယ်ဝင်ရောက်ခွင့် ထုတ်ပေးရန်",
  emailPlaceholder: "အီးမေးလ်",
  passwordPlaceholder: "စကားဝှက်",

  // actions.ts error keys
  errNotSignedIn: "အကောင့်ဝင်ထားခြင်း မရှိပါ",
  errNotAuthorized: "ခွင့်ပြုချက် မရှိပါ",
  errNotAuthorizedModifyLead: "ဤဖောက်သည်လမ်းကြောင်းကို ပြင်ဆင်ခွင့် မရှိပါ",
  errLeadNotFound: "ဖောက်သည်လမ်းကြောင်းကို ရှာမတွေ့ပါ",
  errOnlyLeadsManagersReassign: "ခေါင်းဆောင်၊ မန်နေဂျာ သို့မဟုတ် အက်ဒမင်များသာ ပြန်လည်သတ်မှတ်နိုင်ပါသည်",
  errLostReasonRequired: "လက်လွတ်ရသည့်အကြောင်းရင်း လိုအပ်ပါသည်",
  errFailedToCreateLead: "ဖောက်သည်လမ်းကြောင်း ဖန်တီး၍ မရပါ",
  errUpdateFailed: "မွမ်းမံ၍ မရပါ",
  errFailedToLogActivity: "လုပ်ဆောင်ချက် မှတ်တမ်းတင်၍ မရပါ",
  errDeleteFailed: "ဖျက်၍ မရပါ",
  errNoFileProvided: "ဖိုင် မတင်ရသေးပါ",
  errUploadFailed: "တင်ခြင်း မအောင်မြင်ပါ",
  errLeadMustBeWon: "ပြောင်းလဲရန် ဖောက်သည်လမ်းကြောင်းသည် အောင်မြင်ပြီး ဖြစ်ရပါမည်",
  errAlreadyConverted: "ပြောင်းလဲပြီးဖြစ်သည်",
  errConversionFailed: "ပြောင်းလဲခြင်း မအောင်မြင်ပါ",
  errCustomerNotFound: "ဖောက်သည်ကို ရှာမတွေ့ပါ",
  errCustomerAlreadyHasPortalAccess: "ဤဖောက်သည်တွင် ပေါ်တယ်ဝင်ရောက်ခွင့် ရှိပြီးဖြစ်သည်",
  errAccountAlreadyExists: "ဤအီးမေးလ်ဖြင့် အကောင့် ရှိပြီးဖြစ်သည်",
  errFailedToIssuePortalAccess: "ပေါ်တယ်ဝင်ရောက်ခွင့် ထုတ်ပေး၍ မရပါ",
};

export const b2bDict = { EN: en, MY: my };
