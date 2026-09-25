import {FormEvent, useState} from "react";

type Props = { initialToken: string; onLogin: (token: string) => void; error?: string };

export function Login({initialToken,onLogin,error}: Props) {
  const [token,setToken] = useState(initialToken);
  function submit(e: FormEvent) { e.preventDefault(); if (token.trim()) onLogin(token.trim()); }
  return <main className="auth-shell">
    <section className="auth-card">
      <div className="brand-mark">R</div>
      <h1>Private Knowledge</h1>
      <p>Sign in with your local JWT to search and manage your private knowledge.</p>
      <form onSubmit={submit}>
        <label htmlFor="token">Local access token</label>
        <textarea id="token" value={token} onChange={e=>setToken(e.target.value)} placeholder="Paste your JWT bearer token" rows={5} autoFocus />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={!token.trim()}>Continue</button>
      </form>
      <small>The token is stored only in this browser. Use an OIDC provider instead for production authentication.</small>
    </section>
  </main>;
}
