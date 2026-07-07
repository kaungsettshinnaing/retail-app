-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'CASHIER', 'STOREMAN', 'HR');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('REGULAR', 'PASS_THROUGH', 'CONTACT_PRICE');

-- CreateEnum
CREATE TYPE "OrderChannel" AS ENUM ('POS', 'ONLINE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PICKING', 'PACKED', 'READY', 'DELIVERED', 'PICKED_UP', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PICKED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'COUNTING', 'PLACED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('INVOICE_IN', 'SALE_OUT', 'ADJUSTMENT', 'RETURN_IN');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('OPEN', 'QUOTED', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'COD');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CashEntryType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "CashEntrySource" AS ENUM ('SALE', 'EXPENSE', 'ADJUSTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LEAVE', 'REST_DAY', 'OT');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('FULL', 'HALF');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'LOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roles" "Role"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystemAccount" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WarehouseArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseShelf" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WarehouseShelf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseSection" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "shelfId" TEXT,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WarehouseSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProductType" NOT NULL DEFAULT 'REGULAR',
    "categoryId" TEXT,
    "imageUrl" TEXT,
    "images" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "lowStockAlert" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "optionValues" JSONB NOT NULL,
    "price" INTEGER,
    "comparePrice" INTEGER,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockEntry" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "variantId" TEXT,
    "productId" TEXT,
    "stockEntryId" TEXT,
    "type" "StockMovementType" NOT NULL,
    "qty" INTEGER NOT NULL,
    "previousQty" INTEGER,
    "invoiceItemId" TEXT,
    "orderItemId" TEXT,
    "actorId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNo" TEXT,
    "supplierId" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" INTEGER,
    "paymentMethod" "PaymentMethod",
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "cashierId" TEXT,
    "cashierSubmittedAt" TIMESTAMP(3),
    "counterId" TEXT,
    "counterSubmittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierInvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "description" TEXT,
    "invoicedQty" INTEGER NOT NULL,
    "countedQty" INTEGER,
    "finalQty" INTEGER,
    "unitCost" INTEGER,
    "locationId" TEXT,
    "placedQty" INTEGER,
    "placedAt" TIMESTAMP(3),

    CONSTRAINT "SupplierInvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierInvoiceLog" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierInvoiceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "address" TEXT,
    "isB2B" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "channel" "OrderChannel" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "cashierId" TEXT,
    "customerId" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "paymentMethod" "PaymentMethod",
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "shippingAddress" TEXT,
    "pickedAt" TIMESTAMP(3),
    "packedAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "productType" "ProductType" NOT NULL,
    "productName" TEXT NOT NULL,
    "variantSku" TEXT,
    "variantOptions" JSONB,
    "unitPrice" INTEGER,
    "unitCost" INTEGER,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderPaymentProof" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "OrderPaymentProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockPick" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "qtyPicked" INTEGER NOT NULL,
    "pickedById" TEXT NOT NULL,
    "pickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actorId" TEXT,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceInquiry" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "customerId" TEXT,
    "channel" "OrderChannel" NOT NULL DEFAULT 'ONLINE',
    "status" "InquiryStatus" NOT NULL DEFAULT 'OPEN',
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "message" TEXT,
    "quotedPrice" INTEGER,
    "quotedById" TEXT,
    "quotedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "supplierId" TEXT,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "receiptUrl" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashEntry" (
    "id" TEXT NOT NULL,
    "type" "CashEntryType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "source" "CashEntrySource" NOT NULL,
    "referenceId" TEXT,
    "expenseId" TEXT,
    "date" DATE NOT NULL,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" "Role"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StaffRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "userId" TEXT NOT NULL,
    "staffRoleId" TEXT,
    "employeeNo" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "bankAccount" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "basicSalary" INTEGER NOT NULL DEFAULT 0,
    "attendanceBonus" INTEGER NOT NULL DEFAULT 0,
    "restDays" INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "shiftId" TEXT,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "dayType" "DayType" NOT NULL DEFAULT 'FULL',
    "clockInAt" TIMESTAMP(3),
    "clockOutAt" TIMESTAMP(3),
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "note" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceBreak" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),

    CONSTRAINT "AttendanceBreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryAdvance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvanceInstalment" (
    "id" TEXT NOT NULL,
    "advanceId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "deducted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AdvanceInstalment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeFine" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "deductMonth" INTEGER NOT NULL,
    "deductYear" INTEGER NOT NULL,
    "deducted" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeFine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdHocBonus" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdHocBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollItem" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "basicSalary" INTEGER NOT NULL,
    "workingDays" INTEGER NOT NULL,
    "absentDays" INTEGER NOT NULL,
    "otDays" INTEGER NOT NULL,
    "attendanceBonusAmt" INTEGER NOT NULL,
    "dailyRate" INTEGER NOT NULL,
    "absenceDeduction" INTEGER NOT NULL,
    "otPremium" INTEGER NOT NULL,
    "adHocBonuses" INTEGER NOT NULL,
    "advanceDeduction" INTEGER NOT NULL,
    "fineDeduction" INTEGER NOT NULL,
    "netPay" INTEGER NOT NULL,

    CONSTRAINT "PayrollItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseArea_name_key" ON "WarehouseArea"("name");

-- CreateIndex
CREATE INDEX "WarehouseShelf_areaId_idx" ON "WarehouseShelf"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseShelf_areaId_name_key" ON "WarehouseShelf"("areaId", "name");

-- CreateIndex
CREATE INDEX "WarehouseSection_areaId_idx" ON "WarehouseSection"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseSection_areaId_shelfId_name_key" ON "WarehouseSection"("areaId", "shelfId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "Product_isActive_isOnline_idx" ON "Product"("isActive", "isOnline");

-- CreateIndex
CREATE INDEX "ProductOption_productId_idx" ON "ProductOption"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_productId_name_key" ON "ProductOption"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_isActive_idx" ON "ProductVariant"("isActive");

-- CreateIndex
CREATE INDEX "StockEntry_variantId_idx" ON "StockEntry"("variantId");

-- CreateIndex
CREATE INDEX "StockEntry_locationId_idx" ON "StockEntry"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "StockEntry_variantId_locationId_key" ON "StockEntry"("variantId", "locationId");

-- CreateIndex
CREATE INDEX "StockMovement_variantId_idx" ON "StockMovement"("variantId");

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_stockEntryId_idx" ON "StockMovement"("stockEntryId");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "SupplierInvoice_status_idx" ON "SupplierInvoice"("status");

-- CreateIndex
CREATE INDEX "SupplierInvoice_supplierId_idx" ON "SupplierInvoice"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierInvoice_paidAt_idx" ON "SupplierInvoice"("paidAt");

-- CreateIndex
CREATE INDEX "SupplierInvoiceItem_invoiceId_idx" ON "SupplierInvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "SupplierInvoiceItem_productId_idx" ON "SupplierInvoiceItem"("productId");

-- CreateIndex
CREATE INDEX "SupplierInvoiceLog_invoiceId_idx" ON "SupplierInvoiceLog"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_channel_idx" ON "Order"("channel");

-- CreateIndex
CREATE INDEX "Order_cashierId_idx" ON "Order"("cashierId");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPaymentProof_orderId_key" ON "OrderPaymentProof"("orderId");

-- CreateIndex
CREATE INDEX "OrderPaymentProof_status_idx" ON "OrderPaymentProof"("status");

-- CreateIndex
CREATE INDEX "StockPick_orderId_idx" ON "StockPick"("orderId");

-- CreateIndex
CREATE INDEX "StockPick_orderItemId_idx" ON "StockPick"("orderItemId");

-- CreateIndex
CREATE INDEX "OrderLog_orderId_idx" ON "OrderLog"("orderId");

-- CreateIndex
CREATE INDEX "PriceInquiry_status_idx" ON "PriceInquiry"("status");

-- CreateIndex
CREATE INDEX "PriceInquiry_productId_idx" ON "PriceInquiry"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON "ExpenseCategory"("name");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_categoryId_idx" ON "Expense"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CashEntry_expenseId_key" ON "CashEntry"("expenseId");

-- CreateIndex
CREATE INDEX "CashEntry_date_idx" ON "CashEntry"("date");

-- CreateIndex
CREATE INDEX "CashEntry_source_idx" ON "CashEntry"("source");

-- CreateIndex
CREATE UNIQUE INDEX "StaffRole_name_key" ON "StaffRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNo_key" ON "Employee"("employeeNo");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_name_key" ON "Shift"("name");

-- CreateIndex
CREATE INDEX "Attendance_employeeId_idx" ON "Attendance"("employeeId");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_employeeId_date_key" ON "Attendance"("employeeId", "date");

-- CreateIndex
CREATE INDEX "AttendanceBreak_attendanceId_idx" ON "AttendanceBreak"("attendanceId");

-- CreateIndex
CREATE INDEX "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");

-- CreateIndex
CREATE INDEX "SalaryAdvance_employeeId_idx" ON "SalaryAdvance"("employeeId");

-- CreateIndex
CREATE INDEX "AdvanceInstalment_advanceId_idx" ON "AdvanceInstalment"("advanceId");

-- CreateIndex
CREATE INDEX "AdvanceInstalment_year_month_idx" ON "AdvanceInstalment"("year", "month");

-- CreateIndex
CREATE INDEX "EmployeeFine_employeeId_idx" ON "EmployeeFine"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeFine_deductYear_deductMonth_idx" ON "EmployeeFine"("deductYear", "deductMonth");

-- CreateIndex
CREATE INDEX "AdHocBonus_employeeId_idx" ON "AdHocBonus"("employeeId");

-- CreateIndex
CREATE INDEX "AdHocBonus_year_month_idx" ON "AdHocBonus"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_month_year_key" ON "Payroll"("month", "year");

-- CreateIndex
CREATE INDEX "PayrollItem_payrollId_idx" ON "PayrollItem"("payrollId");

-- CreateIndex
CREATE INDEX "PayrollItem_employeeId_idx" ON "PayrollItem"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollItem_payrollId_employeeId_key" ON "PayrollItem"("payrollId", "employeeId");

-- AddForeignKey
ALTER TABLE "WarehouseShelf" ADD CONSTRAINT "WarehouseShelf_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "WarehouseArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseSection" ADD CONSTRAINT "WarehouseSection_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "WarehouseArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseSection" ADD CONSTRAINT "WarehouseSection_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "WarehouseShelf"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEntry" ADD CONSTRAINT "StockEntry_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEntry" ADD CONSTRAINT "StockEntry_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_stockEntryId_fkey" FOREIGN KEY ("stockEntryId") REFERENCES "StockEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoice" ADD CONSTRAINT "SupplierInvoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoice" ADD CONSTRAINT "SupplierInvoice_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoice" ADD CONSTRAINT "SupplierInvoice_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoiceItem" ADD CONSTRAINT "SupplierInvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "SupplierInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoiceItem" ADD CONSTRAINT "SupplierInvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoiceItem" ADD CONSTRAINT "SupplierInvoiceItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoiceItem" ADD CONSTRAINT "SupplierInvoiceItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoiceLog" ADD CONSTRAINT "SupplierInvoiceLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "SupplierInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierInvoiceLog" ADD CONSTRAINT "SupplierInvoiceLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPaymentProof" ADD CONSTRAINT "OrderPaymentProof_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPaymentProof" ADD CONSTRAINT "OrderPaymentProof_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPick" ADD CONSTRAINT "StockPick_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPick" ADD CONSTRAINT "StockPick_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPick" ADD CONSTRAINT "StockPick_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPick" ADD CONSTRAINT "StockPick_pickedById_fkey" FOREIGN KEY ("pickedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLog" ADD CONSTRAINT "OrderLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLog" ADD CONSTRAINT "OrderLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceInquiry" ADD CONSTRAINT "PriceInquiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceInquiry" ADD CONSTRAINT "PriceInquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceInquiry" ADD CONSTRAINT "PriceInquiry_quotedById_fkey" FOREIGN KEY ("quotedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashEntry" ADD CONSTRAINT "CashEntry_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashEntry" ADD CONSTRAINT "CashEntry_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_staffRoleId_fkey" FOREIGN KEY ("staffRoleId") REFERENCES "StaffRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceBreak" ADD CONSTRAINT "AttendanceBreak_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdvance" ADD CONSTRAINT "SalaryAdvance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdvance" ADD CONSTRAINT "SalaryAdvance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvanceInstalment" ADD CONSTRAINT "AdvanceInstalment_advanceId_fkey" FOREIGN KEY ("advanceId") REFERENCES "SalaryAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeFine" ADD CONSTRAINT "EmployeeFine_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeFine" ADD CONSTRAINT "EmployeeFine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdHocBonus" ADD CONSTRAINT "AdHocBonus_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdHocBonus" ADD CONSTRAINT "AdHocBonus_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_lockedById_fkey" FOREIGN KEY ("lockedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
