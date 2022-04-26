export type HttpResponseDto = {
  url: string | undefined;
  status: number | undefined;
  body: Record<string, unknown> | undefined;
};
