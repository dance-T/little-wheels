import qs from "qs";
import AuthLogin from "./sso";
import { TokenInfoType } from "./type";
const api = {
  token: "/lxwork/api/auth/token",
  permissionTicket: "/lxwork/api/auth/create-permission-ticket",
  authToken: "/sso/realms/myrealm/protocol/openid-connect/token",
  refreshToken: "/lxwork/api/auth/refresh",
};

export interface SearchTokenParams {
  code: string;
  client_id: string;
  state: string;
  redirect_uri: string;
}

async function fetchData<T>(url: string, data?: RequestInit): Promise<T> {
  const response = await fetch(url, data);
  if (!response.ok) {
    debugger;
    console.dir(response, await response.json());
    throw new Error(`HTTP error! status: ${response.status}`);
  }
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
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AuthLogin.getToken(),
        },
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
      return fetchData<TokenInfoType<number>>(`${api.refreshToken}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + AuthLogin.getRefreshToken(),
        },
      });
    },
  };
};
