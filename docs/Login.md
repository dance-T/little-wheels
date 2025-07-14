## keyclock 登录认证

###### 记得在proxy中配置 代理

```react
// 示例代码 和框架无关

const APPID = "xxxx";

let authLogin: AuthLogin;

export default function App() {
  const logout = () => {
    authLogin.logout();
  };

  useEffect(() => {
    // 实例化后才可调用 AuthLogin上的静态方法
    authLogin = new AuthLogin({
      APPID,
    });

    if (!AuthLogin.getTokenInfo()) {
      authLogin.sso();
    } else {
      console.log(AuthLogin.getDecodeToken());
    }
  }, []);
  return (
    <div className="App">
      login
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

