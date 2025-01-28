import { AuditInfoDTO } from "../base";
import { RoleDTO } from "../staff/RoleDTO";

export type UserDTO = {
  code: string;
  refreshToken: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: RoleDTO[];
} & AuditInfoDTO;
