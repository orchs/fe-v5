/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { Button, Modal, message, Table, Tabs, Space, Form, Input, Select, DatePicker, FormInstance } from 'antd';
import { getTimeHeader, getTeamOrders, operateOreders } from '@/services/ltwOrderManage';
import { recordType, recordType2, timeHeaderType, weekType } from '../interface';
import { CommonStoreState } from '@/store/commonInterface';
import { ColumnType } from 'antd/lib/table';
import { RootState } from '@/store/common';
import './index.less';
const { confirm } = Modal;
const { TabPane } = Tabs;
const { TextArea } = Input;

import { useTranslation } from 'react-i18next';
import { pageSizeOptionsDefault } from '@/pages/warning/const';
import moment, { Moment } from 'moment';
import { getTeamInfo } from '@/services/manage';
import { TeamInfo, User } from '@/store/manageInterface';
import { userInfo } from 'os';
interface Props {
  bgid: number;
}
type EditableTableProps = Parameters<typeof Table>[0];
type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;
interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof recordType2;
  record: recordType2;
  handleSave: (record: recordType2, weekInfo, oldData: recordType[], year, week, bgId, currentTableData: recordType2[]) => void;
}
const RightTable: React.FC<Props> = ({ bgid }) => {
  const { Option } = Select;
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [oldTableData, setOldTableData] = useState<recordType[]>([]);
  const [tableData, setTableData] = useState<recordType2[]>([]);
  const [loading, setLoading] = useState(false);
  const [week1, setWeek1] = useState<any>();
  const [week2, setWeek2] = useState<any>();
  const [time, setTime] = useState<any>();
  const [year, setYear] = useState<any>();
  const [week, setWeek] = useState<any>();
  const [memberList, setMemberList] = useState<User[]>([]);

  const leftColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: t('班次'),
      dataIndex: 'duty_conf_name',
      width: 80,
    },
    {
      title: t('值班时间'),
      dataIndex: 'duty_range_time',
      width: 80,
    },
  ];
  // ColumnTypes[number] & { editable?: boolean; dataIndex: string }
  const [rightColumns, setRightColumns] = useState<ColumnTypes[number] & { editable?: boolean; dataIndex: string }[]>([
    {
      title: '',
      dataIndex: 'monday',
      width: 120,
      editable: true,
    },
    {
      title: '',
      dataIndex: 'tuesday',
      width: 120,
      editable: true,
    },
    {
      title: '',
      dataIndex: 'wednesday',
      width: 120,
      editable: true,
    },
    {
      title: '',
      dataIndex: 'thursday',
      width: 120,
      editable: true,
    },
    {
      title: '',
      dataIndex: 'friday',
      width: 120,
      editable: true,
    },
    {
      title: '',
      dataIndex: 'saturday',
      width: 120,
      editable: true,
    },
    {
      title: '',
      dataIndex: 'sunday',
      width: 120,
      editable: true,
    },
    // {
    //   title: t('操作'),
    //   dataIndex: 'operator',
    //   width: 160,
    //   render: (text, record: recordType) => {
    //     return (
    //       <div className='table-operator-area'>
    //         <div
    //           className='table-operator-area-warning'
    //           onClick={() => {
    //             confirm({
    //               title: t('是否删除该班次?'),
    //               onOk: () => {
    //                 console.log(curBusiItem);
    //               },
    //               onCancel() {},
    //             });
    //           }}
    //         >
    //           {t('清空')}
    //         </div>
    //       </div>
    //     );
    //   },
    // },
  ]);
  interface EditableRowProps {
    index: number;
  }
  // const [columns, setColunms] = useState<ColumnType<recordType>[]>([]);
  const [columns, setColunms] = useState<ColumnTypes[number] & { editable?: boolean; dataIndex: string }[]>([]);

  const EditableContext = React.createContext<FormInstance<any> | null>(null);

  const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };
  // 获取团队成员列表
  const getTeamMemberList = (id: string) => {
    getTeamInfo(id).then((data: TeamInfo) => {
      setMemberList(data.users);
    });
  };

  const EditableCell: React.FC<EditableCellProps> = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<any>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
      if (editing) {
        inputRef.current!.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
      try {
        const oldData = _.cloneDeep(oldTableData);
        const currentTableData = _.cloneDeep(tableData);
        const oldyear = year;
        const oldweek = week;
        const values = await form.validateFields();
        const bgId = bgid;
        toggleEdit();
        handleSave({ ...record, ...values }, values, oldData, oldyear, oldweek, bgId, currentTableData);
      } catch (errInfo) {
        message.error(errInfo);
      }
    };
    let childNode = children;
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          // rules={[
          //   {
          //     required: true,
          //     message: `${title} is required.`,
          //   },
          // ]}
        >
          {/* <Input
            ref={inputRef}
            onPressEnter={save}
            // onBlur={save}
            // // value={inputVal}
            // onChange={(e) => {
            //   inputVal = e.target.value;
            //   console.log(e.target.value);
            //   console.log('111');
            // }}
          /> */}
          <Select ref={inputRef} allowClear showSearch onBlur={save} mode='multiple'>
            {memberList.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.nickname}
              </Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <div className='editable-cell-value-wrap' style={{ paddingRight: 24 }} onClick={toggleEdit}>
          {translateUserInfo(record[dataIndex])}
        </div>
      );
    }
    return <td {...restProps}>{childNode}</td>;
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  useEffect(() => {
    if (bgid) {
      getTeamMemberList(bgid.toString());
      if (!time) {
        const newYear = moment().toObject().years;
        const newWeek = moment().week();
        setYear(newYear);
        setWeek(newWeek);
        getTheader(newYear, newWeek);
        get_teamOrders(newYear, newWeek);
      } else {
        if (year && week) {
          get_teamOrders(year, week);
        }
      }
    }
  }, [bgid]);

  function translateUserInfo(userIds: number[] | string | number): string {
    let userInfo = '';
    if (!Array.isArray(userIds)) {
      return userInfo;
    }
    userIds.map((item) => {
      memberList.forEach((items) => {
        if (items.id == item.toString()) {
          userInfo += items.nickname + ',';
        }
      });
    });
    userInfo = userInfo.slice(0, userInfo.length - 1);
    return userInfo;
  }
  function translateData(data): recordType2[] {
    let array: recordType2[] = [];
    let userids: number[] = [];
    let weekData: weekType = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };
    data.map((item) => {
      for (let name in item) {
        if (typeof item[name] == 'object' && item[name].persons !== null) {
          item[name].persons.map((items) => {
            userids.push(items.user_id);
          });
          let uesrArr = _.cloneDeep(userids);
          weekData[name] = uesrArr;
        }
        userids = [];
      }
      let calcWeekData = _.cloneDeep(weekData);
      array.push({
        ...calcWeekData,
        duty_conf_id: item.duty_conf_id,
        duty_conf_name: item.duty_conf_name,
        duty_range_time: item.duty_range_time,
      });
      weekData = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };
    });
    return array;
  }
  const get_teamOrders = async (year, week) => {
    setTableData([]);
    if (!bgid || !year || !week) {
      return;
    }
    setLoading(true);
    const { success, dat } = await getTeamOrders(bgid, year, week);
    if (success) {
      if (dat) {
        const data = dat;
        setOldTableData(dat);
        const table = _.clone(dat);
        setTableData(translateData(dat));
      }
    }
    setLoading(false);
  };

  const handleSave = (
    row: recordType,
    weekInfo: { [x: string]: number[] },
    oldData: recordType[],
    oldyear: number,
    oldweek: number,
    bgId: number,
    currentTableData: recordType2[],
  ) => {
    const newData = _.cloneDeep(currentTableData);
    const index = oldData.findIndex((item) => row.duty_conf_id === item.duty_conf_id);
    const item = oldData[index];
    let duty_date = '';
    let user_ids: number[] = [];
    const item2 = currentTableData[index];
    for (let key in weekInfo) {
      user_ids = weekInfo[key];
      duty_date = item[key].duty_date;
      newData.splice(index, 1, {
        ...item2,
        [key]: weekInfo[key],
      });
    }
    const time = moment();
    const currentTime = '' + time.toObject().years + (time.toObject().months + 1) + time.toObject().date;
    if (Number(currentTime) >= Number(duty_date)) {
      message.error('修改排班失败，不能对历史班次进行修改！');
      return;
    }
    const data = {
      user_ids,
      duty_date,
      duty_conf_id: row.duty_conf_id,
    };
    setTableData(newData);
    operateOreders(bgId, data).then(
      (res) => {},
      (err) => {
        message.error(t(err));
        get_teamOrders(oldyear, oldweek);
      },
    );
  };
  function getTheader(year: number, week: number): void {
    getTimeHeader(year, week).then(
      (res) => {
        let data: timeHeaderType[] = res.dat;
        let columnsData = _.cloneDeep(rightColumns);
        if (data) {
          data.forEach((element, i) => {
            columnsData[i].title = element.display;
          });
          let arr = leftColumns.concat(columnsData);
          let b = arr.map((col) => {
            if (!col.editable) {
              return col;
            }
            return {
              ...col,
              onCell: (record: recordType) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
              }),
            };
          });
          setColunms(b);
        }
      },
      (err) => {
        message.error(err);
      },
    );
  }
  return (
    <div className='strategy-table-content'>
      <div className='strategy-table-search table-handle'>
        <Space>
          <Input.Group>
            <span className='ant-input-group-addon'>班次时间</span>
            <DatePicker
              onChange={(value) => {
                setTime(value);
                if (!value) {
                  return;
                }
                const year = moment(value).toObject().years;
                const week = moment(value).week();
                setYear(year);
                setWeek(week);
                getTheader(year, week);
                get_teamOrders(year, week);
              }}
              defaultValue={moment()}
              format={`YYYY年第${moment(time).week()}周`}
              picker='week'
              value={time}
            />
          </Input.Group>
          {/* <Button
            type='primary'
            style={{ marginRight: 6 }}
            onClick={() => {
              setIsModalVisible(true);
            }}
          >
            {t('复制排班')}
          </Button> */}
        </Space>
      </div>
      <Table
        rowKey='duty_conf_id'
        pagination={{
          total: tableData.length,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) => {
            return `共 ${total} 条数据`;
          },
          pageSizeOptions: pageSizeOptionsDefault,
          defaultPageSize: 30,
        }}
        loading={loading}
        dataSource={tableData}
        columns={columns as ColumnTypes}
        components={components}
        rowClassName={() => 'editable-row'}
      />

      {/* 复制 班次信息 */}
      <Modal
        title='复制排班'
        visible={isModalVisible}
        width='500px'
        confirmLoading={confirmLoading}
        onOk={() => {
          setConfirmLoading(true);
        }}
        onCancel={() => {
          setIsModalVisible(false);
        }}
      >
        <div className='ltworder_modalArea'>
          <DatePicker
            onChange={(value) => {
              setTime(value);
              const year = moment(value).toObject().years;
              const week = moment(value).week();
            }}
            defaultValue={moment()}
            format={`YYYY年第${moment(time).week()}周`}
            picker='week'
            value={time}
          />
          至{' '}
          <DatePicker
            onChange={(value) => {
              setTime(value);
              const year = moment(value).toObject().years;
              const week = moment(value).week();
            }}
            defaultValue={moment()}
            format={`YYYY年第${moment(time).week()}周`}
            picker='week'
            value={time}
          />
        </div>
      </Modal>
    </div>
  );
};

export default RightTable;
