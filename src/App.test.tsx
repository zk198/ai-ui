import {afterEach,describe,expect,it,vi} from "vitest";
import {cleanup,render,screen,waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
afterEach(()=>{cleanup();localStorage.clear();vi.restoreAllMocks();});
describe("App",()=>{
 it("shows local JWT login",()=>{render(<App/>);expect(screen.getByRole("heading",{name:"Private Knowledge"})).toBeInTheDocument();expect(screen.getByLabelText("Local access token")).toBeInTheDocument();});
 it("stores token and opens search",async()=>{const user=userEvent.setup();render(<App/>);await user.type(screen.getByLabelText("Local access token"),"local.jwt.token");await user.click(screen.getByRole("button",{name:"Continue"}));expect(localStorage.getItem("rag-ui.jwt")).toBe("local.jwt.token");expect(screen.getByRole("heading",{name:"What are you looking for?"})).toBeInTheDocument();});
 it("searches through the gateway API",async()=>{const user=userEvent.setup();localStorage.setItem("rag-ui.jwt","token");vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify([{id:"1",text:"Renewal is automatic.",source_name:"contracts.pdf",score:.92,title:"Renewal"}]),{status:200,headers:{"Content-Type":"application/json"}})));render(<App/>);await user.type(screen.getByLabelText("Search query"),"renewal");await user.click(screen.getByRole("button",{name:"Search"}));await waitFor(()=>expect(screen.getByText("Renewal is automatic.")).toBeInTheDocument());expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/search"),expect.objectContaining({method:"POST"}));});
});
