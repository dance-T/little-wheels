export interface AuthLoginType {
  APPID: string;
  storage?: "localStorage";
}

export interface TokenInfoType<T> {
  /** token */
  access_token: string;
  /** `access_token`的过期时间（时间戳） */
  expires_in: T;
  /** 用于调用刷新accessToken的接口时所需的token */
  refresh_token: string;
  /** 头像 */
  avatar?: string;
  /** 用户名 */
  username?: string;
  /** 昵称 */
  nickname?: string;
  /** 当前登录用户的角色 */
  roles?: Array<string>;
  /** 当前登录用户的按钮级别权限 */
  permissions?: Array<string>;

  id_token: string;
  "not-before-policy": number;
  refresh_expires_in: number;
  scope: string;
  session_state: string;
  token_type: "Bearer";
}

export interface PermissionItem {
  rsid: string;
  rsname: string;
  scopes?: string[];
}

export interface DecodeTokenType {
  name: string; // 名字
  preferred_username: string; // 工号
  authorization: {
    permissions: PermissionItem[];
  };
  realm_access: {
    roles: string[];
  };
  resource_access: {
    account: {
      roles: string[];
    };
  };
  acr: string;
  "allowed-origins": string[];
  aud: string;
  auth_time: number;
  azp: string;
  email_verified: boolean;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  scope: string;
  session_state: string;
  sid: string;
  sub: string;
  typ: string;
}

export interface CompanyItem {
  department_cd: string;
  department_name: string;
  sfejfgs: string;
  parent_cd: string;
  type: string;
}

export interface UserGroupItem {
  id: string;
  name: string;
  path: string;
  parentId: string;
  subGroupCount: number;
  attributes: {
    type: string[]; // 3 分公司  4 组
  };
  subGroups: any;
  type: string;
  sfejfgs: any;
}

export interface UserInfo {
  user_name: string;
  gender: string;
  name: string;
  sid: string;
  token_info: DecodeTokenType;
}

interface IAttributes {
  birthdate: any[];
  gender: string[];
  phone: string[];
  customer: any[];
  [key: string]: any[];
}

interface IAttributes {
  birthdate: any[];
  gender: string[];
  phone: string[];
  customer: any[];
}

interface IAccess {
  manageGroupMembership: boolean;
  view: boolean;
  mapRoles: boolean;
  impersonate: boolean;
  manage: boolean;
}

interface IOriginalObj {
  id: string;
  origin: string;
  createdTimestamp: number;
  username: string;
  enabled: boolean;
  totp: boolean;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  email: string;
  attributes: IAttributes;
  disableableCredentialTypes: any[];
  requiredActions: any[];
  notBefore: number;
  access: IAccess;
}

interface IDetail {
  id: string;
  name: string;
  enabled: boolean;
  username: string;
  attributes: IAttributes;
  original_obj: IOriginalObj;
  position: any;
  group: any;
}

export interface UserDetail {
  user_name: string;
  name: string;
  phone: string;
  gender: string;
  position?: string;
  detail: IDetail;
  customer: any[];
}

interface IAccess {
  manageGroupMembership: boolean;
  view: boolean;
  mapRoles: boolean;
  impersonate: boolean;
  manage: boolean;
}

export interface OriginUserDetail {
  id: string;
  origin: string;
  createdTimestamp: number;
  username: string;
  enabled: boolean;
  totp: boolean;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  email: string;
  attributes: IAttributes;
  disableableCredentialTypes: any[];
  requiredActions: any[];
  notBefore: number;
  access: IAccess;
}

export interface SearchUserItem {
  id: string;
  name: string;
  enabled: boolean;
  username: string;
  attributes: IAttributes;
  original_obj: OriginUserDetail;
  position?: string;
  group?: GroupItem;
}

export interface GroupItem {
  id: string;
  name: string;
  path: string;
  parentId: string;
  subGroupCount: any;
  attributes: IAttributes;
  subGroups: any;
  type: string;
  sfejfgs: string;
}

export interface ListRes<T> {
  pageNumber: number;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: T[];
}

export interface RoleItem {
  id: number;
  position_type_id: number;
  position_name: string;
  job_name: string;
  position_code: string;
  remark: string;
}

export interface UserRoleItem {
  client_role: boolean;
  composite: boolean;
  container_id: string;
  id: string;
  name: string;
  client: any;
  client_id: any;
}
