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
