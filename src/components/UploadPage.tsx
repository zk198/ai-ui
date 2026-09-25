import {ChangeEvent, useState} from "react";
import {RagApi} from "../api";

type Props={api:RagApi; onBack:()=>void};
export function UploadPage({api,onBack}:Props) {
  const [file,setFile]=useState<File|null>(null);
  const [source,setSource]=useState("default");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  async function upload() {
    if(!file) return; setBusy(true); setError(""); setMessage("");
    try { await api.upload(file,source.trim()||"default"); setMessage(`Uploaded ${file.name}. Indexing will continue in the background.`); setFile(null); }
    catch(err){setError(err instanceof Error?err.message:"Upload failed");}
    finally{setBusy(false);}
  }
  function choose(e:ChangeEvent<HTMLInputElement>){setFile(e.target.files?.[0]||null);}
  return <div className="app-shell"><header className="topbar"><div><strong>Private Knowledge</strong><span>Add knowledge</span></div><button className="ghost" onClick={onBack}>Back to search</button></header>
  <main className="content narrow"><section className="page-title"><p className="eyebrow">ADD KNOWLEDGE</p><h1>Upload a file</h1><p>Email archives and supported documents can be added to your private index.</p></section>
  <label className="dropzone"><input type="file" onChange={choose}/><span className="upload-icon">↑</span><strong>{file?file.name:"Drop a file here or browse"}</strong><small>{file?"Ready to upload":"Choose a PST, EML, MSG, MBOX, PDF, DOCX or other supported file"}</small></label>
  <label className="field">Source name<input value={source} onChange={e=>setSource(e.target.value)} placeholder="e.g. Email Archive"/></label>
  {error&&<div className="error banner">{error}</div>}{message&&<div className="success banner">{message}</div>}
  <div className="actions"><button className="secondary" onClick={onBack}>Cancel</button><button onClick={upload} disabled={!file||busy}>{busy?"Uploading…":"Upload & index"}</button></div>
  </main></div>;
}
