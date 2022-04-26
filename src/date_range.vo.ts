// 🧼 🚿 A Value Object with transformation logic

export class DateRangeVo {
  public get toWholeDays() {
    const millisecondsTripDuration = this.end.getTime() - this.start.getTime();
    const millisecondsPerDay = this.calculateMillisecondsPerDay();
    const rawStayingNights = millisecondsTripDuration / millisecondsPerDay;
    const stayingNights = Math.round(rawStayingNights);
    return stayingNights;
  }

  constructor(public readonly start: Date, public readonly end: Date) {
    // 🧼 🚿 date range ensures the range is valid
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

  private calculateMillisecondsPerDay() {
    const millisecondsPerSecond = 1000;
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerDay = 24;
    const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute;
    const millisecondsPerHour = millisecondsPerMinute * minutesPerHour;
    const millisecondsPerDay = millisecondsPerHour * hoursPerDay;
    return millisecondsPerDay;
  }
}
