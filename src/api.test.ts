import {describe,expect,it,vi} from "vitest";
import {ApiError,RagApi} from "./api";
describe("RagApi",()=>{
 it("sends bearer authentication",async()=>{const fetchMock=vi.fn().mockResolvedValue(new Response("[]",{status:200}));vi.stubGlobal("fetch",fetchMock);await new RagApi("http://gateway","jwt").search("test");expect(fetchMock).toHaveBeenCalledWith("http://gateway/search",expect.objectContaining({method:"POST"}));const headers=(fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;expect(headers.get("Authorization")).toBe("Bearer jwt");});
 it("surfaces gateway errors",async()=>{vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify({detail:"bad token"}),{status:401})));await expect(new RagApi("http://gateway","bad").search("test")).rejects.toEqual(expect.any(ApiError));});
});
