export class Response {
  public url: string | undefined;
  public status: number | undefined;
  public body: Record<string, unknown> | undefined;
}
export class Http {
  static readonly responseOk = 200;
  static request(url: string, options: unknown): Response {
    console.log(url, options);
    return { url, status: Http.responseOk, body: { data: {} } };
  }
}
