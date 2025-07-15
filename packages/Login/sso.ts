import { useSSOApi } from "./services";
import LocalStorageUtil from "./storage";
import { getUrlParams, isIpAddress, removeUrlParam, subBefore } from "./tools";
import { AuthLoginType, DecodeTokenType, TokenInfoType, UserGroupItem } from "./type";
import qs from "qs";
import { jwtDecode } from "jwt-decode";

/**
 * 单点登录(SSO)认证类，封装与身份认证相关的操作
 *
 * @example
 * const auth = new AuthLogin({ APPID: 'your-app-id' });
 * auth.SSOLogin();
 */
class AuthLogin {
  APPID: string;
  /**
   * 构造函数，初始化SSO认证实例
   * @param {AuthLoginType} config - 认证配置
   * @param {string} config.APPID - 应用唯一标识
   */
  constructor({ APPID }: AuthLoginType) {
    this.APPID = APPID;
    localStorage.setItem("APPID", this.APPID);
  }

  /**
   * 执行单点登录流程
   * @async
   * @description
   * 1. 检查URL参数是否符合SSO要求
   * 2. 获取Token并存储
   * 3. 创建权限票据
   * 4. 获取授权Token
   * @throws {Error} 当SSO流程失败时抛出异常
   */
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

        removeUrlParam(must);
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

  /**
   * 跳转到登录页面
   * @description
   * - 存储当前URL作为回调地址
   * - 构建Keycloak登录URL并跳转
   */

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

  /**
   * 执行登出操作
   * @description
   * - 清除本地存储的Token
   * - 跳转到Keycloak登出页面
   */
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

  /**
   * 存储Token信息
   * @param {TokenInfoType<number>} data - Token数据对象
   * @param {string} [type] - Token类型:
   *   - 'auth'表示授权Token
   *   - 不传表示普通Token
   */
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

  /**
   * 获取公司列表
   * @async
   * @returns {Promise<CompanyItem>} 公司列表数据
   */
  async getCompanyList() {
    return await useSSOApi().getCompanyList();
  }

  /**
   * 获取用户所属分公司名称
   * @async
   * @description 递归查找用户组中类型为'3'(分公司)的节点
   * @returns {Promise<string>} 分公司名称，未找到则返回空字符串
   */
  async getUserBranchGroup() {
    const data = await useSSOApi().getUserGroupList();
    console.log("data: ", data);
    const obj = data.find((item) => item.attributes.type.includes("3"));
    console.log("obj: ", obj);
    if (obj) {
      return obj.name;
    }

    const fun = async (item: UserGroupItem) => {
      if (item.attributes.type.includes("3")) {
        return item.name;
      }
      if (item.parentId) {
        const groupItem = await useSSOApi().getGroupDetail({ id: item.parentId });
        if (groupItem) {
          return fun(groupItem);
        }
      }
      return "";
    };

    let name: string = "";
    for (let i = 0; i < data.length; i += 1) {
      name = await fun(data[i]);
      if (name) {
        break;
      }
    }
    return name;
  }

  /**
   * 刷新Token
   * @async
   * @param {boolean} [forceRefresh=false] - 是否强制刷新
   * @description 在Token临近过期(200秒内)时自动刷新
   */
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

  /**
   * 静态方法：获取Token信息
   * @static
   * @returns {TokenInfoType<number>|null} 存储的Token信息
   * @throws {Error} APPID未初始化时抛出
   */
  static getTokenInfo() {
    const APPID = localStorage.getItem("APPID");
    if (!APPID) {
      throw new Error("APPID is not found, Please instantiate AuthLogin first.");
    }
    const tokenInfo = LocalStorageUtil.getItem<TokenInfoType<number>>(`${APPID}-SSO-tokenInfo`);
    const authTokenInfo = LocalStorageUtil.getItem<TokenInfoType<number>>(`${APPID}-tokenInfo`);
    return authTokenInfo || tokenInfo || null;
  }

  /**
   * 静态方法：获取Access Token
   * @static
   * @returns {string|undefined} Access Token
   */
  static getToken() {
    const tokenInfo = AuthLogin.getTokenInfo();
    return tokenInfo?.access_token;
  }

  /**
   * 静态方法：获取Refresh Token
   * @static
   * @returns {string} Refresh Token，不存在时返回空字符串
   * @throws {Error} APPID未初始化时抛出
   */
  static getRefreshToken() {
    const APPID = localStorage.getItem("APPID");
    if (!APPID) {
      throw new Error("APPID is not found, Please instantiate AuthLogin first.");
    }
    const tokenInfo = LocalStorageUtil.getItem<TokenInfoType<number>>(`${APPID}-SSO-tokenInfo`);
    const authTokenInfo = LocalStorageUtil.getItem<TokenInfoType<number>>(`${APPID}-tokenInfo`);
    return authTokenInfo?.refresh_token || tokenInfo?.refresh_token || "";
  }

  /**
   * 静态方法：解码Token
   * @static
   * @returns {DecodeTokenType} 解码后的Token内容
   */
  static getDecodeToken(): DecodeTokenType {
    const token = AuthLogin.getToken()!;
    return jwtDecode<DecodeTokenType>(token);
  }

  /**
   * 静态方法：清除所有Token
   * @static
   * @throws {Error} APPID未初始化时抛出
   */
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
