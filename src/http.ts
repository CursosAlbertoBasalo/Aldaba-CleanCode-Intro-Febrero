export class Response {
  public url: string | undefined;
  public status: number | undefined;
  public body: Record<string, unknown> | undefined;
}
export class HTTP {
  static request(url: string, options: unknown): Response {
    console.log(url, options);
    return { url, status: 200, body: { data: {} } };
  }
}
