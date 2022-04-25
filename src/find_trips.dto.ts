// 🧼 Data transfer object avoid multiple parameters on methods signatures

export type FindTripsDto = {
  destination: string;
  startDate: Date;
  endDate: Date;
};
