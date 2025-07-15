export function isIpAddress(url: string) {
  try {
    // 使用URL构造函数解析URL
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // IPv4正则表达式模式
    const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6正则表达式模式
    const ipv6Pattern = /^\[?([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}\]?$/;

    // 检查是否是IPv4地址
    if (ipv4Pattern.test(hostname)) {
      return true;
    }

    // 检查是否是IPv6地址
    if (ipv6Pattern.test(hostname)) {
      return true;
    }

    return false;
  } catch (e) {
    // 如果URL解析失败，则返回false
    return false;
  }
}
// 获取URL中所有参数
export function getUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const urlObj = new URL(url);

  // 获取所有参数
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}
// subBefore 截取指定字符前面的值
export function subBefore(str: string, separator: string): string {
  const index = str.indexOf(separator);
  return index !== -1 ? str.substring(0, index) : str;
}

export function removeUrlParam(paramsArr: string[]) {
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const params = new URLSearchParams(url.search);
  paramsArr.forEach((str) => {
    params.delete(str);
  });
  url.search = params.toString(); // 更新URL的查询字符串部分
  window.history.pushState({}, "", url.href); // 更新浏览器历史记录但不刷新页面
}
