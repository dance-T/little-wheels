import { useEffect } from "react";
import { AuthLogin } from "../packages/Login";

const APPID = "lxwork";

let authLogin: AuthLogin;

export default function App() {
  const logout = () => {
    authLogin.logout();
  };

  useEffect(() => {
    authLogin = new AuthLogin({
      APPID,
    });

    if (!AuthLogin.getTokenInfo()) {
      authLogin.SSOLogin();
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
