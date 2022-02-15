export class DateRange {
  constructor(public readonly start: Date, public readonly end: Date) {
    // 🧼 date range ensures the range is valid
    // readonly means that the property cannot be changed
    // if you want to change the property you need to call the assertion form the setter
    this.assertValidDates();
  }
  private assertValidDates() {
    if (this.areInValidDates()) {
      throw new Error("Invalid dates");
    }
  }
  private areInValidDates(): boolean {
    return this.start > this.end;
  }
}
