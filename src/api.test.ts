import {describe,expect,it,vi} from "vitest";
import {ApiError,RagApi} from "./api";
describe("RagApi",()=>{
 it("sends bearer authentication",async()=>{const fetchMock=vi.fn().mockResolvedValue(new Response("[]",{status:200}));vi.stubGlobal("fetch",fetchMock);await new RagApi("http://gateway","jwt").search("test");expect(fetchMock).toHaveBeenCalledWith("http://gateway/search",expect.objectContaining({method:"POST"}));const headers=(fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;expect(headers.get("Authorization")).toBe("Bearer jwt");});
 it("surfaces gateway errors",async()=>{vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify({detail:"bad token"}),{status:401})));await expect(new RagApi("http://gateway","bad").search("test")).rejects.toEqual(expect.any(ApiError));});
 it("supports authenticated source details",async()=>{const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({id:"d1"}),{status:200}));vi.stubGlobal("fetch",fetchMock);await new RagApi("http://gateway","jwt").document("d1");expect(fetchMock).toHaveBeenCalledWith("http://gateway/documents/d1",expect.objectContaining({headers:expect.any(Headers)}));});
});

it("streams grounded answer deltas and citations", async () => {
  const encoder=new TextEncoder();
  const stream=new ReadableStream<Uint8Array>({start(controller){controller.enqueue(encoder.encode('event: delta\\ndata: {"content":"Hello "}\\n\\n'));controller.enqueue(encoder.encode('event: delta\\ndata: {"content":"world"}\\n\\n'));controller.enqueue(encoder.encode('event: done\\ndata: {"conversation_id":"c1","citations":[{"id":"S1","chunk_id":"chunk-1","source_name":"mailbox","text":"Evidence"}]}\\n\\n'));controller.close();}});
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(stream,{status:200})));
  const api=new RagApi("http://gateway","token"); const events=[]; for await(const event of api.streamAnswer("hello")) events.push(event);
  expect(events).toEqual([{type:"delta",content:"Hello "},{type:"delta",content:"world"},{type:"done",conversation_id:"c1",citations:[{id:"S1",chunk_id:"chunk-1",source_name:"mailbox",text:"Evidence"}]}]);
});
