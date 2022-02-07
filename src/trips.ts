import { DB } from "./bd";
import { Trip } from "./trip";

/**
 * Class for offering or canceling trips
 * @public
 */
export class Trips {
  /**
   * Query to get the full list of offered trips
   * @returns {Trip[]} the list of offered trips
   */
  public getList(): Trip[] {
    return DB.select<Trip[]>(`SELECT * FROM trips`);
  }

  /**
   * Query to get the list of offered trips based on the given parameters
   * @param {string} startDate - the start date of the trip
   * @param {string} endDate - the end date of the trip
   * @param {number} maxFlightPrice - the maximum price of the trip
   * @returns {Trip[]} the list of offered trips
   * */
  public getListBy(startDate: Date, endDate: Date, maxFlightPrice: number): Trip[] {
    this.assertDateRange(startDate, endDate);
    return DB.select<Trip[]>(
      `SELECT * FROM trips WHERE start_date >= '${startDate}' AND end_date <= '${endDate}' AND price <= ${maxFlightPrice}`
    );
  }
  private assertDateRange(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new Error("The start date must be before the end date");
    }
  }
}
