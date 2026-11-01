export interface ShiftInputDTO {
  weekDay: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface ReplaceWorkScheduleDTO {
  shifts: ShiftInputDTO[];
}
