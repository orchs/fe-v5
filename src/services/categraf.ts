import request from "@/utils/request";
import { RequestMethod } from "@/store/common";
//获取主机列表
export const getHostList = function (params) {
  return request(`/api/ltw/hosts`, {
    method: RequestMethod.Get,
    params,
  });
};
//获取监控列表
export const getMonitorList = function () {
  return request(`/api/ltw/ctf/conf`, {
    method: RequestMethod.Get,
  });
};
//获取日志列表
export const getLogList = function (params) {
  return request(`/api/ltw/hosts/ctf/conf/logs/`, {
    method: RequestMethod.Get,
    params,
  });
};

//获取某个主机下的监控列表
export const getMonitorListUhost = function (ip) {
  return request(`/api/ltw/hosts/${ip}/ctf/conf`, {
    method: RequestMethod.Get,
  });
};
//批量安装、下发
export const allInstall = function (data) {
  return request(`/api/ltw/hosts/ctf/conf`, {
    method: RequestMethod.Post,
    data,
  });
};
//下发 安装
export const install = function (ip: string, name: string, data) {
  console.log(ip, name, data);
  return request(`/api/ltw/hosts/${ip}/ctf/conf/${name}`, {
    method: RequestMethod.Post,
    data,
  });
};
//删除某个主机下的某个监控
export const deleteMonitor = function (id) {
  return request(`/api/ltw/hosts/ctf/conf/${id}`, {
    method: RequestMethod.Delete,
  });
};
//下发 安装 categraf
export const cateInstall = function (meth,data) {
  return request(`/api/ltw/hosts/ctf/`, {
    method: meth=="post"?RequestMethod.Post: RequestMethod.Delete,
    data,
  });
};
