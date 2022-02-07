export class Traveler {
  public id: string | undefined;
  public name: string;
  public email: string;
  public vipTraveler: boolean;

  constructor(name: string, email: string, isVIP = false) {
    this.name = name;
    this.email = email;
    this.vipTraveler = isVIP;
  }
}
