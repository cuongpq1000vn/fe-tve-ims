import { AuditInfoDTO } from "../base";
import { DiscountDTO } from "../discount";

export type InvoiceDTO = {
  id: number;
  studentNickName: string;
  discount: DiscountDTO;
  studentPhoneNumber: string;
  staffName: string;
  studentName: string;
  studentCode: string;
  classCode: string;
  className: string;
  tuitionOwed: number;
  invoiceDiscount: number;
  amount: number;
  paymentType: PaymentTypeConstants;
  description: string;
  invoiceStatus: InvoiceStatusConstants;
} & AuditInfoDTO;

export enum InvoiceStatusConstants {
  NOT_PAID = "NOT_PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  FULLY_PAID = "FULLY_PAID",
}

export enum PaymentTypeConstants {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}
