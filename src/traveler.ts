export class Traveler {
  public id: string;
  public name: string;
  public email: string;
  public isVIP: boolean;

  constructor(name: string, email: string, isVIP = false) {
    this.name = name;
    this.email = email;
    this.isVIP = isVIP;
  }
}
