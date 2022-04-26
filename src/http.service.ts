import { HttpRequestDto } from "./http_request.dto";
import { HttpResponseDto } from "./http_response.dto";

export class HttpService {
  static request(httpRequest: HttpRequestDto): HttpResponseDto {
    console.log(httpRequest);
    return { url: httpRequest.url, status: 200, body: { data: {} } };
  }
}
