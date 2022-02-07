export class Response {
  public url: string;
  public status: number;
  public body: unknown;
}
export class HTTP {
  static request(url: string, options: unknown): Response {
    console.log(url, options);
    return { url, status: 200, body: { data: {} } };
  }
}
