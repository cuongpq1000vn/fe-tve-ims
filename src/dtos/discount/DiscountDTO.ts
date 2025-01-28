import { AuditInfoDTO } from "../base";

export type DiscountDTO = {
    id: number;
    type: string;
    description: string;
} & AuditInfoDTO;