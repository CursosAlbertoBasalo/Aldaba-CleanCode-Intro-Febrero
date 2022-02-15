// 🧼 Data transfer object avoid multiple parameters on methods signatures

export type FindTripsDTO = {
  destination: string;
  startDate: Date;
  endDate: Date;
};
