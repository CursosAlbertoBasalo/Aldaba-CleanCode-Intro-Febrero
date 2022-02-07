export class DB {
  public static select<T>(query: string): T[] {
    console.log(query);
    return [];
  }
  public static findOne<T>(query: string): T {
    console.log(query);
    return {} as T;
  }
  public static post<T>(dao: T): string {
    console.log(dao);
    return Date.now().toString();
  }
  public static Update<T>(dao: T): number {
    console.log(dao);
    return 1;
  }
}
