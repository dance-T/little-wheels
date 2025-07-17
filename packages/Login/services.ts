import qs from "qs";
import AuthLogin from "./sso";
import { CompanyItem, TokenInfoType, UserGroupItem } from "./type";
const api = {
  token: "/lxwork/api/auth/token",
  permissionTicket: "/lxwork/api/auth/create-permission-ticket",
  authToken: "/sso/realms/myrealm/protocol/openid-connect/token",
  refreshToken: "/lxwork/api/auth/refresh",

  userGroup: "/lxwork/api/auth/users/groups",
  groups: "/lxwork/api/auth/groups",
  allCompany: "/lxwork/api/auth/groups/branch",
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
  };
};
