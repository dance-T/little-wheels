class LocalStorageUtil {
  // 设置存储
  static setItem(key: string, value: any): void {
    const appId = localStorage.getItem("APPID");
    if (typeof value === "object") {
      localStorage.setItem(appId + "-" + key, JSON.stringify(value));
    } else {
      localStorage.setItem(appId + "-" + key, value);
    }
  }

  // 获取存储
  static getItem<T>(key: string): T | null {
    const appId = localStorage.getItem("APPID");
    const value = localStorage.getItem(appId + "-" + key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        return value as T;
      }
    }
    return null;
  }

  // 删除存储
  static removeItem(key: string): void {
    const appId = localStorage.getItem("APPID");
    localStorage.removeItem(appId + "-" + key);
  }

  // 清空所有存储
  static clear(): void {
    const appId = localStorage.getItem("APPID");
    // 删除所有 appId + '-'  前缀的存储
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(appId + "-")) {
        localStorage.removeItem(key);
      }
    });
  }
  static clearAll(): void {
    localStorage.clear();
  }
}

export default LocalStorageUtil;
