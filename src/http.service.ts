export type HttpResponse = {
  url: string | undefined;
  status: number | undefined;
  body: Record<string, unknown> | undefined;
};
type HttpRequest = {
  url: string;
  options: unknown;
};

export class HttpService {
  static request(httpRequest: HttpRequest): HttpResponse {
    console.log(httpRequest);
    return { url: httpRequest.url, status: 200, body: { data: {} } };
  }
}
