export class DB {
  public static select<T>(query: string): T {
    console.log(query);
    return undefined;
  }
  public static insert<T>(dao: T): string {
    console.log(dao);
    return Date.now().toString();
  }
  public static update<T>(dao: T): number {
    console.log(dao);
    return 1;
  }
}
