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
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { Button, Modal, message, Table, Tabs, Space, Form, Input, TimePicker, InputNumber } from 'antd';
import { getOrderList, deleteOrder, editOrder } from '@/services/ltwOrderManage';
import { orderType } from '../interface';
import { CommonStoreState } from '@/store/commonInterface';
import { ColumnType } from 'antd/lib/table';
import { RootState } from '@/store/common';
const { confirm } = Modal;
const { TabPane } = Tabs;
const { TextArea } = Input;

import { useTranslation } from 'react-i18next';
import { pageSizeOptionsDefault } from '@/pages/warning/const';
import moment, { Moment } from 'moment';
interface Props {
  bgid?: number;
}

const PageTable: React.FC<Props> = ({ bgid }) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('添加班次');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>();
  const [priority, setPriority] = useState<number>(1);
  const [cid, setCid] = useState<number>();
  const [start_at, setStart_at] = useState<any>();
  const [end_at, setEnd_at] = useState<any>();

  useEffect(() => {
    if (bgid) {
      getTeamOrders();
    }
  }, [bgid]);

  const getTeamOrders = async () => {
    if (!bgid) {
      return;
    }
    setLoading(true);
    const { success, dat } = await getOrderList(bgid);
    if (success) {
      setTableData(dat);
      setLoading(false);
    }
  };

  const refreshList = () => {
    getTeamOrders();
  };

  const columns: ColumnType<orderType>[] = [
    {
      title: t('班次'),
      dataIndex: 'name',
      width: 80,
    },
    {
      title: t('开始时间'),
      dataIndex: 'start_at',
      width: 120,
    },
    {
      title: t('结束时间'),
      dataIndex: 'end_at',
      width: 80,
    },
    {
      title: t('优先级'),
      dataIndex: 'priority',
      width: 80,
    },
    {
      title: t('更新人'),
      dataIndex: 'update_by',
      width: 80,
    },
    {
      title: t('更新时间'),
      dataIndex: 'update_at',
      width: 120,
      render: (text: number) => (text !== 0 ? moment.unix(text).format('YYYY-MM-DD HH:mm:ss') : ''),
    },
    {
      title: t('操作'),
      dataIndex: 'operator',
      width: 160,
      render: (text, record: orderType) => {
        return (
          <div className='table-operator-area'>
            <div
              className='table-operator-area-normal'
              onClick={() => {
                setModalTitle('编辑班次');
                setName(record.name);
                setPriority(record.priority);
                setCid(record.id);
                setIsModalVisible(true);
                setStart_at(record.start_at);
                setEnd_at(record.end_at);
              }}
            >
              {t('编辑')}
            </div>
            <div
              className='table-operator-area-warning'
              onClick={() => {
                confirm({
                  title: t('是否删除该班次?'),
                  onOk: () => {
                    deleteOrder([record.id], bgid).then(() => {
                      message.success(t('删除成功'));
                      refreshList();
                    });
                  },
                  onCancel() {},
                });
              }}
            >
              {t('删除')}
            </div>
          </div>
        );
      },
    },
  ];

  function editOrderInfo(): void {
    const startTime = typeof start_at == 'object' ? moment(start_at).format('HH:mm:ss') : start_at;
    const endTime = typeof end_at == 'object' ? moment(end_at).format('HH:mm:ss') : end_at;
    editOrder(bgid, { name, priority, start_at: startTime, end_at: endTime }, cid).then(
      (res) => {
        let text = '班次信息更新成功！';
        message.success(t(text));
        refreshList();
        setConfirmLoading(false);
        setIsModalVisible(false);
        setName('');
        setPriority(1);
        setCid(0);
        setStart_at('');
        setEnd_at('');
      },
      (err) => {
        message.error(err);
        setConfirmLoading(false);
      },
    );
  }
  function addOrderInfo(): void {
    editOrder(bgid, { name, priority, start_at: moment(start_at).format('HH:mm:ss'), end_at: moment(end_at).format('HH:mm:ss') }).then(
      (res) => {
        let text = '班次信息添加成功！';
        message.success(t(text));
        refreshList();
        setConfirmLoading(false);
        setIsModalVisible(false);
        setName('');
        setPriority(1);
        setCid(0);
        setStart_at('');
        setEnd_at('');
      },
      (err) => {
        message.error(err);
        setConfirmLoading(false);
      },
    );
  }
  function changePriority(): void {}
  return (
    <div className='strategy-table-content'>
      <div className='strategy-table-search table-handle'>
        <Button
          type='primary'
          style={{ marginRight: 6 }}
          onClick={() => {
            setModalTitle('添加班次');
            setStart_at(moment('00:00:00', 'HH:mm:ss'));
            setEnd_at(moment('23:59:59', 'HH:mm:ss'));
            setIsModalVisible(true);
          }}
        >
          {t('添加班次')}
        </Button>
      </div>
      <Table
        rowKey='id'
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
        columns={columns}
      />

      {/* 添加/编辑 班次信息 */}
      <Modal
        title={modalTitle}
        visible={isModalVisible}
        width='500px'
        confirmLoading={confirmLoading}
        onOk={() => {
          if (typeof priority !== 'number') {
            message.error('班次优先级应设置为数字，请重新输入');
            return;
          }
          setConfirmLoading(true);
          if (cid) {
            editOrderInfo();
          } else {
            addOrderInfo();
          }
        }}
        onCancel={() => {
          setIsModalVisible(false);
          setName('');
          setPriority(1);
          setCid(0);
          setStart_at('');
          setEnd_at('');
        }}
      >
        <div className='ltworder_modalArea'>
          <Form className='ltwminstall_leftAreaForm' labelCol={{ span: 4 }} wrapperCol={{ span: 14 }}>
            <Form.Item label='班次名称:'>
              <Input
                onChange={(e) => {
                  setName(e.currentTarget.value);
                }}
                placeholder='请输入班次名称'
                allowClear
                value={name}
              />
            </Form.Item>
            <Form.Item
              label='值班时间:'
              rules={[
                {
                  required: true,
                  message: t('开始时间不能为空'),
                },
              ]}
            >
              <TimePicker
                onChange={(value) => {
                  setStart_at(value);
                }}
                defaultValue={moment('00:00:00', 'HH:mm:ss')}
                value={start_at ? moment(start_at, 'HH:mm:ss') : moment('00:00:00', 'HH:mm:ss')}
              />
              至
              <TimePicker
                onChange={(value) => {
                  setEnd_at(value);
                }}
                defaultValue={moment('23:59:59', 'HH:mm:ss')}
                value={end_at ? moment(end_at, 'HH:mm:ss') : moment('23:59:59', 'HH:mm:ss')}
              />
            </Form.Item>
            <Form.Item label='优先级:' className='ltwminstall_leftSelectItem'>
              <InputNumber
                min={0}
                max={10}
                defaultValue={1}
                value={priority}
                onChange={(value: number) => {
                  setPriority(value);
                }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default PageTable;
