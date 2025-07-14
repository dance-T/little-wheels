import { useSSOApi } from "./services";
import LocalStorageUtil from "./storage";
import { getUrlParams, isIpAddress, subBefore } from "./tools";
import { AuthLoginType, DecodeTokenType, TokenInfoType } from "./type";
import qs from "qs";
import { jwtDecode } from "jwt-decode";

class AuthLogin {
  APPID: string;
  constructor({ APPID }: AuthLoginType) {
    this.APPID = APPID;
    localStorage.setItem("APPID", this.APPID);
  }

  async SSOLogin() {
    // 获取 url 中的参数
    const params = getUrlParams(location.href) as any;
    const must = ["state", "code", "iss", "session_state"];
    const mustLength = must.length;
    if (Object.keys(params).length !== mustLength) {
      this.login();
      return;
    }

    // url 参数满足 must 里的全部值，才判定为单点登录，避免非单点登录时刷新页面无限循环
    let sso = [];
    let start = 0;

    while (start < mustLength) {
      if (Object.keys(params).includes(must[start]) && sso.length <= mustLength) {
        sso.push(must[start]);
      } else {
        sso = [];
      }
      start++;
    }

    if (sso.length === mustLength) {
      // 判定为单点登录

      // 清空本地旧信息
      AuthLogin.removeToken();
      let tokenInfo: TokenInfoType<number>;
      const login_redirect_uri = LocalStorageUtil.getItem<string>("login_redirect_uri")!;
      const { code, state } = params;
      try {
        tokenInfo = await useSSOApi().getTokenInfo({
          code,
          client_id: this.APPID,
          state,
          redirect_uri: login_redirect_uri,
        });
        this.setToken(tokenInfo);
        const { ticket } = await useSSOApi().createPermissionTicket({ client_id: this.APPID });
        const authTokenInfo = await useSSOApi().getAuthTokenInfo({ grant_type: "urn:ietf:params:oauth:grant-type:uma-ticket", ticket });
        this.setToken(authTokenInfo, "auth");
        Object.keys(params).forEach((key) => {
          if (must.includes(key)) {
            delete params[key];
          }
        });
        const newUrl = `${location.origin}${location.pathname}${subBefore(location.hash, "?")}${Object.keys(params).length ? "?" + qs.stringify(params) : ""}`;

        // 替换历史记录项
        window.location.replace(newUrl);
      } catch (err) {
        console.log("err: ", err, login_redirect_uri);
        AuthLogin.removeToken();
        window.location.href = login_redirect_uri;
      }
    } else {
      this.login();
      return;
    }
  }

  login() {
    const { host, href, origin } = window.location;

    const params: any = {
      redirect_uri: href,
      client_id: this.APPID,
      scope: "openid",
    };
    LocalStorageUtil.setItem(`login_redirect_uri`, params.redirect_uri);
    if (isIpAddress(origin) && window.location.hostname !== "localhost") {
      params.keycloak_host = origin + "/sso/";
    }
    let str = `/lxwork/api/auth/login?${qs.stringify(params)}`;
    window.location.replace(str);
  }

  logout() {
    const { host, href, origin } = window.location;
    const { id_token } = AuthLogin.getTokenInfo() || {};
    AuthLogin.removeToken();

    LocalStorageUtil.removeItem(`login_redirect_uri`);

    const params: any = {
      id_token_hint: id_token,
      post_logout_redirect_uri: href,
    };
    if (isIpAddress(origin) && window.location.hostname !== "localhost") {
      params.keycloak_host = origin + "/sso/";
    }
    let str = `/lxwork/api/auth/endsession?${qs.stringify(params)}`;
    window.location.href = str;
  }

  setToken(data: TokenInfoType<number>, type?: string) {
    if (type === "auth") {
      const tokenInfo = LocalStorageUtil.getItem<TokenInfoType<number>>(`${this.APPID}-SSO-tokenInfo`);
      if (!data.id_token && tokenInfo) {
        data.id_token = tokenInfo.id_token;
      }
      LocalStorageUtil.setItem(`${this.APPID}-tokenInfo`, data);
    } else {
      LocalStorageUtil.setItem(`${this.APPID}-SSO-tokenInfo`, data);
    }
  }

  async refreshToken(forceRefresh?: boolean) {
    const { exp } = AuthLogin.getDecodeToken();
    const now = Date.now() / 1000; //  now exp
    // 快过期了
    if (forceRefresh || (now > exp - 200 && now < exp)) {
      const authTokenInfo = await useSSOApi().refreshAuthToken();
      this.setToken(authTokenInfo);
      this.setToken(authTokenInfo, "auth");
    }
  }

  static getTokenInfo() {
    const APPID = localStorage.getItem("APPID");
    if (!APPID) {
      throw new Error("APPID is not found, Please instantiate AuthLogin first.");
    }
    const tokenInfo = LocalStorageUtil.getItem<TokenInfoType<number>>(`${APPID}-SSO-tokenInfo`);
    const authTokenInfo = LocalStorageUtil.getItem<TokenInfoType<number>>(`${APPID}-tokenInfo`);
    return authTokenInfo || tokenInfo || null;
  }

  static getToken() {
    const tokenInfo = AuthLogin.getTokenInfo();
    return tokenInfo?.access_token;
  }

  static getRefreshToken() {
    const APPID = localStorage.getItem("APPID");
    if (!APPID) {
      throw new Error("APPID is not found, Please instantiate AuthLogin first.");
    }
    const tokenInfo = LocalStorageUtil.getItem<TokenInfoType<number>>(`${APPID}-SSO-tokenInfo`);
    const authTokenInfo = LocalStorageUtil.getItem<TokenInfoType<number>>(`${APPID}-tokenInfo`);
    return authTokenInfo?.refresh_token || tokenInfo?.refresh_token || "";
  }

  static getDecodeToken(): DecodeTokenType {
    const token = AuthLogin.getToken()!;
    return jwtDecode<DecodeTokenType>(token);
  }

  static removeToken() {
    const APPID = localStorage.getItem("APPID");
    if (!APPID) {
      throw new Error("APPID is not found, Please instantiate AuthLogin first.");
    }
    LocalStorageUtil.removeItem(`${APPID}-tokenInfo`);
    LocalStorageUtil.removeItem(`${APPID}-SSO-tokenInfo`);
  }
}

export default AuthLogin;
