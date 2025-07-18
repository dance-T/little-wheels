import qs from "qs";
import AuthLogin from "./sso";
import { CompanyItem, ListRes, OriginUserDetail, RoleItem, SearchUserItem, TokenInfoType, UserDetail, UserGroupItem, UserInfo, UserRoleItem } from "./type";
const api = {
  token: "/lxwork/api/auth/token",
  permissionTicket: "/lxwork/api/auth/create-permission-ticket",
  authToken: "/sso/realms/myrealm/protocol/openid-connect/token",
  refreshToken: "/lxwork/api/auth/refresh",

  userGroup: "/lxwork/api/auth/users/groups",
  groups: "/lxwork/api/auth/groups",
  allCompany: "/lxwork/api/auth/groups/branch",

  userinfo: "/lxwork/api/auth/userinfo",

  user: "/lxwork/api/auth/users",
};

export interface SearchTokenParams {
  code: string;
  client_id: string;
  state: string;
  redirect_uri: string;
}

let reLoginCount = 0;

async function fetchData<T>(url: string, data?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + AuthLogin.getToken(),
    },
    ...(data || {}),
  });
  if (!response.ok) {
    console.dir(response, await response.json());
    const APPID = localStorage.getItem("APPID");
    if (response.status === 401 && APPID && reLoginCount < 10) {
      reLoginCount += 1;
      const authLogin = new AuthLogin({ APPID });
      await authLogin.SSOLogin();
      return await fetchData(url, data);
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  reLoginCount = 0;
  return (await response.json()) as T;
}

export const useSSOApi = () => {
  return {
    getTokenInfo: (params: SearchTokenParams) => {
      return fetchData<TokenInfoType<number>>(`${api.token}?${qs.stringify(params)}`);
    },
    createPermissionTicket: (data: { client_id: string }) => {
      return fetchData<{ ticket: string }>(`${api.permissionTicket}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    getAuthTokenInfo: (data: { grant_type: string; ticket: string }) => {
      const params = new URLSearchParams();
      params.append("grant_type", data.grant_type);
      params.append("ticket", data.ticket);

      return fetchData<TokenInfoType<number>>(`${api.authToken}`, {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: "Bearer " + AuthLogin.getToken() },
      });
    },
    refreshAuthToken: () => {
      return fetchData<TokenInfoType<number>>(`${api.refreshToken}`, {});
    },
    getCompanyList: () => fetchData<CompanyItem[]>(`${api.allCompany}`, {}),
    getUserGroupList: () => fetchData<UserGroupItem[]>(`${api.userGroup}`, {}),
    getGroupDetail: ({ id }: { id: string }) => fetchData<UserGroupItem>(`${api.groups}/${id}`),

    getUserInfo: () => {
      return fetchData<UserInfo>(`${api.userinfo}`);
    },

    /**
     * 获取当前登录用户详细信息
     */
    getUserDetail: () => fetchData<UserDetail>(`${api.user}/detail`),

    /**
     * 获取当前登录用户详细信息
     * @param id 用户id
     */
    getUserDetailById: ({ id }: { id: string }) => fetchData<OriginUserDetail>(`${api.user}/${id}`),

    /**
     * 根据工号姓名等搜索用户
     * @param params.username 工号  至少四个字符
     * @param params.real_name 姓名  至少两个字符
     * @param params.exact 是否精确查找, 如果为 true 只返回完全匹配的记录, 否则返回模糊匹配的记录
     * @param params.enable 用户是否可用，如果为 true 只返回 enabled 的用户
     * @param params.first Pagination offset, 从 0 开始
     * @param params.max_size Maximum results size (defaults to 100)
     * @param params.extend 如果为 true 返回 position 和 department 字段，，代表用户的岗位和部门
     */
    getUsers: (params: { real_name?: string; exact?: boolean; enable?: boolean; first?: number; max_size?: number; extend?: boolean }) => {
      return fetchData<SearchUserItem[]>(`${api.user}/search`, {
        method: "GET",
        body: JSON.stringify(params),
      });
    },

    /**
     * 根据角色名称搜索用户列表（带分页）
     * @param params 查询参数对象
     * @param params.role_name 必填，角色名称（需完全匹配）
     * @param params.name 可选，用户姓名模糊搜索（支持部分匹配）
     * @param params.page 可选，分页页码（从1开始计数，默认1）
     * @param params.page_size 可选，每页数据量（默认10）
     * @returns Promise<ListRes<SearchUserItem>> 返回分页格式的用户列表数据
     */
    getUsersByRole: (params: { role_name: string; name?: string; page?: number; page_size?: number }) => {
      return fetchData<ListRes<SearchUserItem>>(`${api.user}/search-by-role`, {
        method: "GET",
        body: JSON.stringify(params),
      });
    },

    /**
     * 获取当前用户可用的分公司或业务组
     * 如果当前用户属于分公司，则返回分公司及下属分公司，如果属于分公司下的部门，则返回部门下的业务组， 如果属于业务组，则返回业务组
     * @returns Promise<CompanyItem[]>
     */

    getCurUserGroupList: () => {
      return fetchData<CompanyItem[]>(`${api.user}/group/list`, {
        method: "GET",
      });
    },

    /**
     * 获取所有岗位角色名称
     * @returns Promise<RoleItem[]>
     */

    getAllRoles: () => {
      return fetchData<RoleItem[]>(`${api.user}/all-roles`, {
        method: "GET",
      });
    },

    /**
     * 获取当前用户Roles
     * @returns Promise<UserRoleItem[]>
     */
    getCurUserRoles: () => {
      return fetchData<UserRoleItem[]>(`${api.user}/role-mappings`, {
        method: "GET",
      });
    },
  };
};
