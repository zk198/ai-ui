import {useMemo,useState} from "react";
import {clearToken,loadToken,saveToken} from "./auth";
import {PREFILLED_TOKEN,API_BASE_URL} from "./config";
import {RagApi} from "./api";
import {Login} from "./components/Login";
import {SearchPage} from "./components/SearchPage";
import {ChatPage} from "./components/ChatPage";
import {UploadPage} from "./components/UploadPage";
import {SourcesPage} from "./components/SourcesPage";
import {DetailPage} from "./components/DetailPage";

export default function App() {
  const [token,setToken]=useState(()=>loadToken(PREFILLED_TOKEN));
  const [page,setPage]=useState<"search"|"chat"|"upload"|"sources"|"detail">("search");
  const [detail,setDetail]=useState<{kind:"message"|"document";id:string}|null>(null);
  const api=useMemo(()=>new RagApi(API_BASE_URL,token),[token]);
  function login(value:string){saveToken(value);setToken(value);}
  function logout(){clearToken();setToken("");setPage("search");}
  if(!token) return <Login initialToken={PREFILLED_TOKEN} onLogin={login}/>;
  if(page==="chat") return <ChatPage api={api} onBack={()=>setPage("search")} onSources={()=>setPage("sources")} onLogout={logout}/>;
  if(page==="upload") return <UploadPage api={api} onBack={()=>setPage("search")}/>;
  if(page==="sources") return <SourcesPage api={api} onBack={()=>setPage("search")}/>;
  if(page==="detail" && detail) return <DetailPage api={api} kind={detail.kind} id={detail.id} onBack={()=>setPage("search")}/>;
  return <SearchPage api={api} onLogout={logout} onUpload={()=>setPage("upload")} onSources={()=>setPage("sources")} onChat={()=>setPage("chat")} onDetail={(kind,id)=>{setDetail({kind,id});setPage("detail")}}/>;
}
