import {useMemo,useState} from "react";
import {clearToken,loadToken,saveToken} from "./auth";
import {PREFILLED_TOKEN,API_BASE_URL} from "./config";
import {RagApi} from "./api";
import {Login} from "./components/Login";
import {SearchPage} from "./components/SearchPage";
import {UploadPage} from "./components/UploadPage";

export default function App() {
  const [token,setToken]=useState(()=>loadToken(PREFILLED_TOKEN));
  const [page,setPage]=useState<"search"|"upload">("search");
  const api=useMemo(()=>new RagApi(API_BASE_URL,token),[token]);
  function login(value:string){saveToken(value);setToken(value);}
  function logout(){clearToken();setToken("");setPage("search");}
  if(!token) return <Login initialToken={PREFILLED_TOKEN} onLogin={login}/>;
  return page==="upload" ? <UploadPage api={api} onBack={()=>setPage("search")}/> : <SearchPage api={api} onLogout={logout} onUpload={()=>setPage("upload")}/>;
}
