export interface RecordType {
  hostname: string;
  ip: string;
  private_ip: string;
  status: string;
  actions: string[];
  port: string;
  admin_user: string;
}
export interface monitorType {
  indexes: string;
  name: string;
  toml: string;
}
export interface monitorItem {
  id: number;
  name: string;
  update_at: number;
  remote_toml: string;
  local_toml: string;
  template_toml: string;
  status: string;
}
export interface logItem {
  id: number;
  name: string;
  hostname: string;
  ip: string;
  status: string;
  update_by: string;
  update_at: number;
  message: string;
  stand_out: string;
  last_toml: string;
  current_toml: string;
}
