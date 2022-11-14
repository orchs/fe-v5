import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { number } from 'echarts';

//获取所有班次列表
export const getOrderList = function (gid) {
  return request(`/api/ltw/groups/${gid}/duty-conf`, {
    method: RequestMethod.Get,
  });
};
//删除某个班次
export const deleteOrder = function (cid, gid) {
  return request(`/api/ltw/groups/${gid}/duty-conf/${cid}`, {
    method: RequestMethod.Delete,
  });
};
//新增班次
export const editOrder = function (gid, data, cid?: number) {
  let requestUrl = `/api/ltw/groups/${gid}/duty-conf`;
  if (cid) {
    requestUrl = `/api/ltw/groups/${gid}/duty-conf/${cid}`;
  }
  return request(requestUrl, {
    method: cid ? RequestMethod.Put : RequestMethod.Post,
    data,
  });
};
//获取时间表头
export const getTimeHeader = function (year: number, week: number) {
  return request(`/api/ltw/years/${year}/weeks/${week}/`, {
    method: RequestMethod.Get,
  });
};
//获取某个业务组下面的排班
export const getTeamOrders = function (gid: number, year: number, week: number) {
  return request(`/api/ltw/groups/${gid}/duty-roster/years/${year}/weeks/${week}/`, {
    method: RequestMethod.Get,
  });
};
//修改某个业务组下面的排班
export const operateOreders = function (gid: number, data) {
  return request(`/api/ltw/groups/${gid}/duty-roster`, {
    method: RequestMethod.Post,
    data,
  });
};
