import React, { useState, useRef, useEffect } from 'react';
import Editor from '../editor';
import { Table, Divider, Popconfirm, Tag, Input, Button, message, Select, Drawer, Form, Spin, Space, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, MinusOutlined, ControlOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { monitorType, RecordType, monitorItem } from '../interface';
import { getMonitorList, getHostList, getMonitorListUhost, allInstall, install, deleteMonitor, cateInstall } from '@/services/categraf';
import './index.less';
// import internal from 'stream';
import DiffEditor from '../editorDiff';

const index = (_props: any) => {
  const { Option } = Select;
  const { t, i18n } = useTranslation();
  const searchRef = useRef<Input>(null);
  const [tableProps, setTableProps] = useState([] as any[]);
  const [batchDrawer, setBatchDrawer] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [installDrawer, setInstallDrawer] = useState(false);
  const [hostList, setHostList] = useState([] as any[]);
  const [currentHost, setCurrentHost] = useState({
    hostname: '',
    ip: '',
  });
  const [monitorList, setMonitorList] = useState([] as any[]);
  const [fieldsList, setFieldsList] = useState({});
  const [tomlList, setTomlList] = useState({});
  const [currentFieldsList, setCurrentFieldsList] = useState([] as any[]);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');
  const [hostQuery, setHostQuery] = useState('');
  //批量安装
  const [hostListD, setHostListD] = useState([] as any[]);
  const [selectedList, setSelectedList] = useState([] as any[]);
  const [selHost, setSelHost] = useState([] as any[]);
  const [selMonitor, setSelMonitor] = useState('');
  const [local_toml, setlLocal_toml] = useState('');
  //单独安装
  const [install_name, setInstall_name] = useState('');
  const [serverConf, setServerConf] = useState('');
  const [localConf, setLocalConf] = useState('');
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [detail, setDetail] = useState('');
  const [hostLoading, setHostLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [drawertLoading, setDrawertLoading] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [cateDrawer, setCateDrawer] = useState(false);
  const [cateDrawerTitle, setCateDrawerTitle] = useState('批量安装categraf');
  const [cateiFlag, setCateiFlag] = useState(false);
  const [checkAllFlag, setCheckAllFlag] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [installFlag, setInstallFlag] = useState(true);
  const [action, setAction] = useState('');
  const [ip, setIP] = useState('');
  const [status, setStatus] = useState('');
  const [statusDrawer, setStatusDrawer] = useState('');
  //获取监控列表（下拉选择）
  function get_monitorList() {
    getMonitorList().then(
      (res) => {
        if (res.success) {
          let monitorsArr: string[] = [];
          let fieldsArr = {};
          let tomlList = {};
          const arr = res.dat;
          arr.forEach((ele: monitorType) => {
            monitorsArr.push(ele.name);
            fieldsArr[ele.name] = ele.indexes;
            tomlList[ele.name] = ele.toml;
          });
          setMonitorList(monitorsArr);
          setFieldsList(fieldsArr);
          setTomlList(tomlList);
        }
      },
      (err) => {
        message.error(err);
      },
    );
  }
  //监控项   下拉选择
  function changeMonitor(value: string) {
    setKey('');
    if (!value) {
      message.warning(t('请至少选中一个监控项或者输入主机名称/IP进行查询操作'));
      setName('');
      setCurrentFieldsList([]);
      return;
    }
    setName(value);
    setHostList([]);
    setHostLoading(true);
    get_hostList(value);
    setCurrentFieldsList(fieldsList[value]);
  }
  //索引项   下拉选择
  function changeIndexes(value: string) {
    if (!value) {
      setKey('');
      return;
    }
    setKey(value);
    setHostList([]);
    setHostLoading(true);
    get_hostList('', value);
  }
  //获取主机列表
  function get_hostList(hostName?: string, hostKey?: string) {
    if (!hostName && !name && !query) {
      message.warning(t('请至少选中一个监控项或者输入主机名称/IP进行查询操作'));
      return;
    }
    setCurrentHost({ hostname: '', ip: '' });
    setTableProps([]);
    getHostList({ name: hostName || name, key: hostKey || key, value, query }).then(
      (res) => {
        setHostList(res.dat.list);
        setHostLoading(false);
      },
      (err) => {
        message.error(err);
        setHostLoading(false);
      },
    );
  }
  //Drawer 获取主机列表
  function get_hostListD() {
    if (!hostQuery) {
      message.warning(t('请输入主机名称或IP进行查询'));
      return;
    }
    setDrawertLoading(true);
    getHostList({ query: hostQuery }).then(
      (res) => {
        setHostListD(res.dat.list);
        setDrawertLoading(false);
        if (res.dat.list.length > 0) {
          setCheckAllFlag(true);
        }
      },
      (err) => {
        message.error(err);
        setDrawertLoading(false);
      },
    );
  }
  //获取某个主机下的所有监控
  function get_monitorListUhost(ip: string) {
    getMonitorListUhost(ip).then(
      (res) => {
        setTableProps(res.dat.list);
        setTableLoading(false);
      },
      (err) => {
        setTableLoading(false);
        message.error(t(err));
      },
    );
  }
  useEffect(() => {
    get_monitorList();
  }, []);
  //删除某个主机下的某项监控
  function handleDel(id: number) {
    deleteMonitor(id).then(
      (res) => {
        message.success(t('监控项删除成功'));
        get_monitorListUhost(currentHost.ip);
        setTableLoading(false);
      },
      (err) => {
        setTableLoading(false);
        message.error(t(err));
      },
    );
  }
  // //添加主机
  // function addHost(host: RecordType) {
  //   let hostArr = _.cloneDeep(selectedList);
  //   let arr = _.cloneDeep(selHost);
  //   if (!_.includes(arr, host.ip)) {
  //     hostArr.push(host);
  //     setSelectedList(hostArr);
  //     arr.push(host.ip);
  //     setSelHost(arr);
  //   }
  //   const flag = hostListD.every((ele) => {
  //     return _.includes(arr, ele.ip);
  //   });
  //   setCheckAllFlag(!flag);
  // }
  // //移除主机
  // function removeHost(host: RecordType, ip: string) {
  //   let hostArr = _.cloneDeep(selectedList);
  //   let arr = _.cloneDeep(selHost);
  //   const index = arr.findIndex((item) => {
  //     return item == ip;
  //   });
  //   hostArr.splice(index, 1);
  //   arr.splice(index, 1);
  //   setSelectedList(hostArr);
  //   setSelHost(arr);
  //   const flag = hostListD.every((ele) => {
  //     return _.includes(arr, ele.ip);
  //   });
  //   setCheckAllFlag(!flag);
  // }
  // //全选主机
  // function addAllHost() {
  //   let hostArr = _.cloneDeep(selectedList);
  //   let arr = _.cloneDeep(selHost);
  //   setCheckAllFlag(false);
  //   hostListD.forEach((ele, index) => {
  //     if (!_.includes(arr, ele.ip)) {
  //       hostArr.push(ele);
  //       arr.push(ele.ip);
  //     }
  //   });
  //   setSelectedList(hostArr);
  //   setSelHost(arr);
  //   setCheckAllFlag(false);
  // }
  // //取消全选主机
  // function removeAllHost() {
  //   let hostArr = _.cloneDeep(selectedList);
  //   let arr = _.cloneDeep(selHost);
  //   setCheckAllFlag(true);
  //   hostListD.forEach((ele) => {
  //     for (let i = 0; i < arr.length; i++) {
  //       if (arr[i] == ele.ip) {
  //         hostArr.splice(i, 1);
  //         arr.splice(i, 1);
  //         i--;
  //       }
  //     }
  //   });
  //   setSelectedList(hostArr);
  //   setSelHost(arr);
  // }
  //Drawer change监控项
  function changeSelMonitor(value: string) {
    if (!value) {
      setSelMonitor('');
      setlLocal_toml('');
      return;
    }
    setSelMonitor(value);
    setlLocal_toml(tomlList[value]);
  }
  //单独安装/下发配置项
  function install_(is_apply: boolean) {
    if (localConf == '') {
      message.warning(t('配置文件不能为空，请确认！'));
      return;
    }
    setDrawerLoading(true);
    install(currentHost.ip, install_name, { is_apply, local_toml: localConf }).then(
      (res) => {
        let text = '下发成功！';
        if (!is_apply) {
          text = '安装成功！';
        }
        message.success(t(text));
        setDrawerLoading(false);
        setInstallDrawer(false);
        setTableProps([]);
        setTableLoading(true);
        get_monitorListUhost(currentHost.ip);
      },
      (err) => {
        message.error(err);
        setDrawerLoading(false);
        setTableLoading(false);
      },
    );
  }
  //批量安装/下发配置项
  function all_install(is_apply: boolean) {
    if (selectedRowKeys.length == 0) {
      message.warning(t('未选择任何主机，请选择!'));
      return;
    }
    if (!selMonitor) {
      message.warning(t('请选择监控项！'));
      return;
    }
    if (local_toml == '') {
      message.warning(t('配置文件不能为空，请确认！'));
      return;
    }
    setDrawerLoading(true);
    allInstall({ ips: selectedRowKeys, local_toml, name: selMonitor, is_apply }).then(
      (res) => {
        let text = '下发成功！';
        if (!is_apply) {
          text = '配置文件正在下发，稍后请在操作日志中查看任务进度!';
        }
        message.success(t(text));
        setDrawerLoading(false);
        setHostQuery('');
        setHostListD([]);
        setSelectedRowKeys([]);
        setSelMonitor('');
        setlLocal_toml('');
        setBatchDrawer(false);
        setTableProps([]);
        setTableLoading(true);
        get_monitorListUhost(currentHost.ip);
      },
      (err) => {
        message.error(err);
        setDrawerLoading(false);
        setTableLoading(false);
      },
    );
  }
  //批量安装/卸载 categraf
  function cate_installAll() {
    if (selectedRowKeys.length == 0) {
      message.warning(t('未选择任何主机，请选择!'));
      return;
    }
    setDrawerLoading(true);
    let text = '批量安装成功！';
    let action = 'INSTALL';
    if (!cateiFlag) {
      text = '批量卸载成功！';
      action = 'UNINSTALL';
    }
    cateInstall({ action, ips: selectedRowKeys }).then(
      (res) => {
        message.success(t(text));
        setDrawerLoading(false);
        setHostQuery('');
        setHostListD([]);
        setSelectedRowKeys([]);
        setCateDrawer(false);
      },
      (err) => {
        message.error(err);
        setDrawerLoading(false);
      },
    );
  }
  //单独安装/卸载 categraf
  function cate_install(action: string, ip: string) {
    const text = translateActionsType(action) + '成功！';
    cateInstall({ action, ips: [ip] }).then(
      (res) => {
        message.success(t(text));
        get_hostList();
      },
      (err) => {
        message.error(err);
        setHostLoading(false);
      },
    );
  }
  //渲染按钮
  function translateActionsType(val: string): string {
    switch (val) {
      case 'INSTALL':
        return '安装';
      case 'ENABLE':
        return '启用';
      case 'UPDATE':
        return '更新';
      case 'UNINSTALL':
        return '卸载';
      case 'DISABLED':
        return '禁用';
      default:
        return '';
    }
  }
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: RecordType) => ({
      disabled: !record.port || !record.admin_user, // 当端口与管理信息字段为空时，设置该行不允许被选中
    }),
  };
  // 左侧主机表格
  const columns1: ColumnProps<RecordType>[] = [
    {
      title: t('主机名'),
      dataIndex: 'hostname',
      align: 'center',
    },
    {
      title: t('IP'),
      dataIndex: 'ip',
      align: 'center',
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      render: (text, record, index) => {
        // 参数分别为当前行的值，当前行数据，行索引
        let color = 'default';
        let content = '未安装';
        if (text == 'DISABLED') {
          // color = "success";
          content = '未启用';
        } else if (text == 'ENABLED') {
          color = 'success';
          content = '已启用';
        }
        return <Tag color={color}>{content}</Tag>;
      },
    },
    {
      title: t('table.operations'),
      // dataIndex: 'actions',
      align: 'center',
      width: 240,
      render: (_text, record, index) => {
        let status = record.status;
        const actions = record.actions;
        return actions.map((item) => {
          return (
            <Button
              type='primary'
              className='ltw_operButton'
              onClick={(e) => {
                //阻止事件冒泡到父元素
                e.stopPropagation();
                setIP(record.ip);
                if (status == 'UNINSTALLED') {
                  setModalContent(`确定要在${record.hostname}上安装categraf服务？`);
                } else {
                  setModalContent(`确定要${translateActionsType(item) + record.hostname}上的categraf服务？`);
                }
                setAction(item);
                setIsModalVisible(true);
              }}
            >
              {t(translateActionsType(item))}
            </Button>
          );
        });
        // <Button
        //   type='primary'
        //   onClick={(e) => {
        //     //阻止事件冒泡到父元素
        //     e.stopPropagation();
        //     setIP(record.ip);
        //     if (status == 'DISABLED') {
        //       setModalContent(`确定要在${record.hostname}上安装categraf服务？`);
        //       setInstallFlag(true);
        //     } else if (status == 'ENABLED') {
        //       setModalContent(`确定要卸载${record.hostname}上的categraf服务？`);
        //       setInstallFlag(false);
        //     }
        //     setIsModalVisible(true);
        //   }}
        // >
        //   {t(content)}
        // </Button>
      },
    },
  ];
  // 右侧监控表格
  const columns2: ColumnProps<monitorItem>[] = [
    {
      title: t('监控项名称'),
      dataIndex: 'name',
      width: 200,
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      width: 100,
      render: (text, record, index) => {
        // 参数分别为当前行的值，当前行数据，行索引
        let color = 'default';
        let content = '未安装';
        if (text == 'INSTALLED') {
          color = 'success';
          content = '已安装';
        } else if (text == 'CONFLICTING') {
          color = 'error';
          content = '有冲突';
        } else if (text == 'ERROR') {
          color = 'error';
          content = '错误';
        }
        return <Tag color={color}>{content}</Tag>;
      },
    },
    {
      title: t('更新人'),
      dataIndex: 'update_by',
      width: 100,
    },
    {
      title: t('更新时间'),
      dataIndex: 'update_at',
      width: 160,
      render: (text) => {
        if (!text) {
          return '';
        } else {
          return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
    {
      title: t('table.operations'),
      width: 220,
      render: (_text, record) => {
        return (
          <span>
            <a
              style={{ color: '#40a9ff' }}
              onClick={() => {
                setDetail(record.local_toml);
                setDetailDrawer(true);
              }}
            >
              {t('查看')}
            </a>
            <Divider type='vertical' />
            <a
              style={{ color: '#40a9ff' }}
              onClick={() => {
                setInstall_name(record.name);
                setDrawerTitle(`配置${record.name}监控`);
                setServerConf('');
                setServerConf(record.remote_toml);
                setLocalConf('');
                setLocalConf(record.local_toml || record.template_toml);
                setInstallDrawer(true);
              }}
            >
              {t('配置')}
            </a>
            <Divider type='vertical' />
            <Popconfirm
              title={<div style={{ width: 100 }}>{t('table.delete.sure')}</div>}
              onConfirm={() => {
                setTableLoading(true);
                handleDel(record.id);
              }}
            >
              <a style={{ color: 'red', display: record.status == 'UNINSTALLED' ? 'none' : 'inline-block' }}>{t('table.delete')}</a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];
  // //Drawer 备选主机表格
  // const columns5: ColumnProps<RecordType>[] = [
  //   {
  //     title: t('主机名'),
  //     dataIndex: 'hostname',
  //     align: 'center',
  //   },
  //   {
  //     title: t('IP'),
  //     dataIndex: 'ip',
  //     width: 160,
  //     align: 'center',
  //   },
  //   {
  //     title: t('table.operations'),
  //     width: 80,
  //     align: 'center',
  //     render: (_text, record) => {
  //       return (
  //         <span>
  //           <a
  //             style={{ color: '#000' }}
  //             onClick={() => {
  //               addHost(record);
  //             }}
  //           >
  //             {' '}
  //             <PlusOutlined />
  //           </a>
  //         </span>
  //       );
  //     },
  //   },
  // ];

  // Drawer 主机表格
  const columns3: ColumnProps<RecordType>[] = [
    {
      title: t('主机名'),
      dataIndex: 'hostname',
      width: 200,
      align: 'center',
    },
    {
      title: t('IP'),
      dataIndex: 'ip',
      width: 160,
      align: 'center',
    },
    {
      title: t('端口'),
      dataIndex: 'port',
      width: 100,
      align: 'center',
    },
    {
      title: t('管理信息'),
      dataIndex: 'admin_user',
      width: 120,
      align: 'center',
    },
    {
      title: t('版本'),
      dataIndex: 'version',
      width: 100,
      align: 'center',
    },
  ];

  return (
    <PageLayout
      hideCluster
      title={
        <>
          <ControlOutlined />
          {t('categraf管理/安装管理')}
        </>
      }
    >
      <div style={{ display: 'flex' }}>
        <div className='ltwminstall_leftArea'>
          <Form labelCol={{ span: 5 }} wrapperCol={{ span: 18, offset: 1 }} layout='horizontal'>
            {' '}
            <Form.Item label='监控项:' className='ltwminstall_leftSelectItem'>
              <Select onChange={changeMonitor} allowClear showSearch value={name}>
                {monitorList.map((item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label='索引项:' className='ltwminstall_leftSelectItem'>
              <Select onChange={changeIndexes} allowClear value={key} placeholder='请选择索引值'>
                {currentFieldsList.map((item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label='索引值:' className='ltwminstall_leftSelectItem'>
              <Input
                ref={searchRef}
                prefix={<SearchOutlined />}
                onChange={(e) => {
                  setValue(e.currentTarget.value);
                }}
                placeholder='请输入索引值进行查询'
                allowClear
                onPressEnter={(e) => {
                  if (!name && !query) {
                    message.warning(t('请至少选中一个监控项或者输入主机名称/IP进行查询操作'));
                    return;
                  }
                  setHostList([]);
                  setHostLoading(true);
                  get_hostList();
                }}
              />
            </Form.Item>
            <Form.Item label='主机:' className='ltwminstall_leftSelectItem'>
              <Input
                ref={searchRef}
                prefix={<SearchOutlined />}
                onChange={(e) => {
                  setQuery(e.currentTarget.value);
                }}
                onPressEnter={(e) => {
                  if (!name && !query) {
                    message.warning(t('请至少选中一个监控项或者输入主机名称/IP进行查询操作'));
                    return;
                  }
                  setHostList([]);
                  setHostLoading(true);
                  get_hostList();
                }}
                placeholder='请输入主机名/ip查询'
                allowClear
              />
            </Form.Item>
          </Form>
          <div className='ltwminstall_leftFilter'>
            <Select
              onChange={(value: string) => {
                setStatus(value);
              }}
              allowClear
              placeholder='请选择状态'
              style={{ width: 120 }}
              defaultValue=''
            >
              <Option key='UNINSTALLED' value='UNINSTALLED'>
                未安装
              </Option>
              <Option key='DISABLED' value='DISABLED'>
                未启用
              </Option>
              <Option key='ENABLED' value='ENABLED'>
                已启用
              </Option>
            </Select>
          </div>
          <Spin spinning={hostLoading} delay={200}>
            <div className='ltwminstall_leftAreaList'>
              <Table
                rowKey={(record) => record.ip}
                columns={columns1}
                // dataSource={hostList}
                dataSource={hostList.filter((ele) => {
                  if (!status) {
                    return true;
                  }
                  return ele.status == status;
                })}
                onRow={(record) => {
                  return {
                    onClick: (e) => {
                      setTableProps([]);
                      setCurrentHost({ hostname: record.hostname, ip: record.ip });
                      if (record.status !== 'ENABLED') {
                        return;
                      }
                      setTableLoading(true);
                      get_monitorListUhost(record.ip);
                    },
                  };
                }}
                rowClassName={(record) => {
                  return currentHost.ip == record.ip ? 'ltw_cateClickRow' : '';
                }}
                pagination={
                  {
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '50', '100', '500', '1000'],
                    showTotal: (total) => {
                      return i18n.language == 'en' ? `Total ${total} items` : `共 ${total} 条`;
                    },
                  } as any
                }
              />
            </div>
          </Spin>
        </div>
        <div className='ltwminstall_rightArea'>
          <div className='ltwminstall_rightAreaBut'>
            <Space>
              <Input
                prefix={<SearchOutlined />}
                onPressEnter={(e) => {
                  setSearchValue(e.currentTarget.value);
                }}
                placeholder='监控项名称'
                allowClear
              />
              <Button
                type='primary'
                onClick={() => {
                  setCateDrawerTitle('批量安装categraf');
                  setCateiFlag(true);
                  setCateDrawer(true);
                }}
              >
                {t('批量安装categraf')}
              </Button>
              <Button
                type='primary'
                onClick={() => {
                  setCateDrawerTitle('批量卸载categraf');
                  setCateiFlag(false);
                  setCateDrawer(true);
                }}
              >
                {t('批量卸载categraf')}
              </Button>
              <Button
                type='primary'
                onClick={() => {
                  setBatchDrawer(true);
                }}
              >
                {t('批量配置监控项')}
              </Button>
            </Space>
          </div>
          <Spin spinning={tableLoading} delay={200}>
            <Table
              rowKey={(record) => record.name}
              columns={columns2}
              dataSource={tableProps.filter((ele) => {
                if (!searchValue) {
                  return true;
                }
                return ele.name == searchValue;
              })}
              pagination={
                {
                  showSizeChanger: true,
                  defaultPageSize: 50,
                  pageSizeOptions: [50, 100, 500, 1000],
                  showTotal: (total) => {
                    return i18n.language == 'en' ? `Total ${total} items` : `共 ${total} 条`;
                  },
                } as any
              }
            />
          </Spin>
        </div>
        {/* 批量配置 */}
        <Drawer
          title='批量配置'
          placement='right'
          onClose={() => {
            setBatchDrawer(false);
            setHostQuery('');
            setHostListD([]);
            setSelectedRowKeys([]);
            setSelMonitor('');
            setlLocal_toml('');
          }}
          visible={batchDrawer}
          width={1000}
        >
          <Spin spinning={drawerLoading} delay={200}>
            <div className='ltwminstall_drawerArea'>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('选择主机')}:</div>
                <div className='ltwminstall_drawerSelectContent'>
                  <Input
                    style={{ width: 300 }}
                    prefix={<SearchOutlined />}
                    onChange={(e) => {
                      setHostQuery(e.currentTarget.value);
                    }}
                    value={hostQuery}
                    placeholder='请输入主机名/ip查询'
                    allowClear
                    onPressEnter={(e) => {
                      get_hostListD();
                    }}
                  />
                  <Button
                    type='primary'
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      get_hostListD();
                    }}
                  >
                    {t('查询')}
                  </Button>
                </div>
              </div>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'></div>
                <div className='ltwminstall_drawerSelectContent ltwminstall_drawerCheck'>
                  <span className='ltwminstall_drawerCheckTips'>{selectedRowKeys.length > 0 ? `已选择 ${selectedRowKeys.length} 项` : ''}</span>
                  <div className='ltwminstall_leftFilter'>
                    <Select
                      onChange={(value: string) => {
                        setStatusDrawer(value);
                        setSelectedRowKeys([]);
                      }}
                      allowClear
                      placeholder='请选择状态'
                      style={{ width: 120 }}
                      defaultValue=''
                    >
                      <Option key='UNINSTALLED' value='UNINSTALLED'>
                        未安装
                      </Option>
                      <Option key='DISABLED' value='DISABLED'>
                        未启用
                      </Option>
                      <Option key='ENABLED' value='ENABLED'>
                        已启用
                      </Option>
                    </Select>
                  </div>
                  {/* <Button
                    type='primary'
                    onClick={() => {
                      addAllHost();
                    }}
                    style={{ display: checkAllFlag && hostListD.length > 0 ? 'block' : 'none' }}
                  >
                    全选
                  </Button>
                  <Button type='primary' style={{ display: hostListD.length > 0 ? 'none' : 'block' }} disabled>
                    全选
                  </Button>
                  <Button
                    type='primary'
                    onClick={() => {
                      removeAllHost();
                    }}
                    style={{ display: hostListD.length > 0 && !checkAllFlag ? 'block' : 'none' }}
                  >
                    取消全选
                  </Button> */}
                </div>
              </div>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('主机')}:</div>
                <div className='ltwminstall_drawerSelectContent ltwinstall_drawerTable ltwinstall_drawerTable2'>
                  <Spin spinning={drawertLoading} delay={200}>
                    <Table
                      rowKey={(record) => record.ip}
                      columns={columns3}
                      dataSource={hostListD.filter((ele) => {
                        if (!statusDrawer) {
                          return true;
                        }
                        return ele.status == statusDrawer;
                      })}
                      rowSelection={rowSelection}
                    />
                  </Spin>
                </div>
              </div>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('监控项')}:</div>
                <div className='ltwminstall_drawerSelectContent'>
                  <Select onChange={changeSelMonitor} allowClear showSearch placeholder='请选择监控类型' style={{ width: 300 }} value={selMonitor}>
                    {monitorList.map((item) => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('配置文件')}:</div>
                <div className='ltwminstall_drawerSelectContent ' style={{ width: '800px' }}>
                  <Editor value={local_toml} height='200px' readOnly={false} onChange={(value) => setlLocal_toml(value)} />
                </div>
              </div>
              <div className='ltwminstall_drawerSelect' style={{ marginTop: '30px' }}>
                <div className='ltwminstall_drawerSelectLabel'></div>
                <div className='ltwminstall_drawerSelectContent '>
                  <Button
                    type='primary'
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      all_install(true);
                    }}
                  >
                    {t('下发')}
                  </Button>
                  <Button
                    type='primary'
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      all_install(false);
                    }}
                  >
                    {t('保存')}
                  </Button>
                  <Button
                    type='primary'
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      setHostQuery('');
                      setHostListD([]);
                      setSelectedRowKeys([]);
                      setSelMonitor('');
                      setlLocal_toml('');
                      setBatchDrawer(false);
                    }}
                  >
                    {t('取消')}
                  </Button>
                </div>
              </div>
            </div>
          </Spin>
        </Drawer>
        {/* 单独 */}
        <Drawer
          title={drawerTitle}
          placement='right'
          onClose={() => {
            setServerConf('');
            setLocalConf('');
            setInstallDrawer(false);
          }}
          visible={installDrawer}
          width={1200}
        >
          <Spin spinning={drawerLoading} delay={200}>
            <div className='ltwminstall_drawerArea'>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('主机')}:</div>
                <div className='ltwminstall_drawerSelectContent '>
                  <Tag color='green' style={{ lineHeight: '32px' }}>
                    {currentHost.hostname}
                  </Tag>
                </div>
              </div>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('服务器配置')}:</div>
                <div className='ltwminstall_drawerSelectContent' style={{ width: '1034px' }}>
                  <DiffEditor readOnly={false} value={localConf} value2={serverConf} height='400px' onChange={(value) => setLocalConf(value[0])} />
                </div>
              </div>
              {/* <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('服务器配置')}:</div>
                <div className='ltwminstall_drawerSelectContent ' style={{ width: '600px' }}>
                  <Editor value={serverConf} height='400px' readOnly={true} />
                </div>
              </div>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('本地配置')}:</div>
                <div className='ltwminstall_drawerSelectContent ' style={{ width: '600px' }}>
                  <Editor value={localConf} height='400px' readOnly={false} onChange={(value) => setLocalConf(value)} />
                </div>
              </div> */}
              <div className='ltwminstall_drawerSelect' style={{ marginTop: '30px' }}>
                <div className='ltwminstall_drawerSelectLabel'></div>
                <div className='ltwminstall_drawerSelectContent '>
                  <Button
                    type='primary'
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      install_(true);
                    }}
                    disabled={serverConf == localConf ? true : false}
                  >
                    {t('下发')}
                  </Button>
                  <Button
                    type='primary'
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      install_(false);
                    }}
                  >
                    {t('保存')}
                  </Button>
                  <Button
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      setServerConf('');
                      setLocalConf('');
                      setInstallDrawer(false);
                    }}
                  >
                    {t('取消')}
                  </Button>
                </div>
              </div>
            </div>
          </Spin>
        </Drawer>
        <Drawer
          title={t('详情')}
          placement='right'
          onClose={() => {
            setDetailDrawer(false);
          }}
          visible={detailDrawer}
          width={800}
        >
          <div className='ltwminstall_detailArea' style={{ whiteSpace: 'pre-line' }}>
            <Editor value={detail} height='500px' readOnly={true} placeholder='' />
          </div>
        </Drawer>
        {/* 批量安装/卸载categraf */}
        <Drawer
          title={cateDrawerTitle}
          placement='right'
          onClose={() => {
            setHostQuery('');
            setHostListD([]);
            setSelectedRowKeys([]);
            setCateDrawer(false);
          }}
          visible={cateDrawer}
          width={1000}
        >
          <Spin spinning={drawerLoading} delay={200}>
            <div className='ltwminstall_drawerArea'>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('选择主机')}:</div>
                <div className='ltwminstall_drawerSelectContent'>
                  <Input
                    style={{ width: 300 }}
                    prefix={<SearchOutlined />}
                    onChange={(e) => {
                      setHostQuery(e.currentTarget.value);
                    }}
                    value={hostQuery}
                    placeholder='请输入主机名/ip查询'
                    allowClear
                    onPressEnter={(e) => {
                      get_hostListD();
                    }}
                  />
                  <Button
                    type='primary'
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      get_hostListD();
                    }}
                  >
                    {t('查询')}
                  </Button>
                </div>
              </div>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'></div>
                <div className='ltwminstall_drawerSelectContent ltwminstall_drawerCheck'>
                  <span className='ltwminstall_drawerCheckTips'>{selectedRowKeys.length > 0 ? `已选择 ${selectedRowKeys.length} 项` : ''}</span>
                  <div className='ltwminstall_leftFilter'>
                    <Select
                      onChange={(value: string) => {
                        setStatusDrawer(value);
                        setSelectedRowKeys([]);
                      }}
                      allowClear
                      placeholder='请选择状态'
                      style={{ width: 120 }}
                      defaultValue=''
                    >
                      <Option key='UNINSTALLED' value='UNINSTALLED'>
                        未安装
                      </Option>
                      <Option key='DISABLED' value='DISABLED'>
                        未启用
                      </Option>
                      <Option key='ENABLED' value='ENABLED'>
                        已启用
                      </Option>
                    </Select>
                  </div>
                </div>
              </div>
              <div className='ltwminstall_drawerSelect'>
                <div className='ltwminstall_drawerSelectLabel'>{t('主机')}:</div>
                <div className='ltwminstall_drawerSelectContent ltwinstall_drawerTable'>
                  {/* dataSource={hostListD}  */}
                  <Spin spinning={drawertLoading} delay={200}>
                    <Table
                      rowKey={(record) => record.ip}
                      columns={columns3}
                      dataSource={hostListD.filter((ele) => {
                        if (!statusDrawer) {
                          return true;
                        }
                        return ele.status == statusDrawer;
                      })}
                      rowSelection={rowSelection}
                    />
                  </Spin>
                </div>
              </div>
              <div className='ltwminstall_drawerSelect' style={{ marginTop: '30px' }}>
                <div className='ltwminstall_drawerSelectLabel'></div>
                <div className='ltwminstall_drawerSelectContent '>
                  <Button
                    type='primary'
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      cate_installAll();
                    }}
                  >
                    {t('确认')}
                  </Button>
                  <Button
                    type='primary'
                    style={{ marginLeft: '30px' }}
                    onClick={() => {
                      setHostQuery('');
                      setHostListD([]);
                      setSelectedRowKeys([]);
                      setCateDrawer(false);
                    }}
                  >
                    {t('取消')}
                  </Button>
                </div>
              </div>
            </div>
          </Spin>
        </Drawer>
        <Modal
          title='提示'
          visible={isModalVisible}
          onOk={() => {
            setHostLoading(true);
            cate_install(action, ip);
            setIsModalVisible(false);
          }}
          onCancel={() => {
            setIsModalVisible(false);
            setModalContent('');
          }}
        >
          <p>{modalContent}</p>
        </Modal>
      </div>
    </PageLayout>
  );
};
export default index;
