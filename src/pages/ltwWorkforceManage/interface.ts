export interface recordType {
  duty_conf_id: number;
  duty_conf_name: string;
  duty_range_time: string;
  monday: DateType;
  tuesday: DateType;
  thursday: DateType;
  wednesday: DateType;
  friday: DateType;
  saturday: DateType;
  sunday: DateType;
}
export interface recordType2 {
  duty_conf_id: number;
  duty_conf_name: string;
  duty_range_time: string;
  monday: number[];
  tuesday: number[];
  thursday: number[];
  wednesday: number[];
  friday: number[];
  saturday: number[];
  sunday: number[];
}
export interface weekType {
  monday: number[];
  tuesday: number[];
  thursday: number[];
  wednesday: number[];
  friday: number[];
  saturday: number[];
  sunday: number[];
}
export interface DateType {
  duty_date: number;
  persons: personType[];
}
export interface personType {
  user_id: number;
  username: string;
}
export interface timeHeaderType {
  date: number;
  display: string;
  week: number;
}
export interface orderType {
  name: string;
  priority: number;
  id: number;
  start_at: number;
  end_at: number;
}
