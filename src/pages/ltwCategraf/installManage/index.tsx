import React, { useState, useRef, useEffect } from 'react';
import Editor from '../editor';
import { Table, Divider, Popconfirm, Tag, Input, Button, message, Select, Drawer, Form, Spin, Modal } from 'antd';
import { SearchOutlined, ControlOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
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
import { removeDashboard } from '@/services';
import { Resizable } from 're-resizable';

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
  //批量安装
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
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [action, setAction] = useState('');
  const [ip, setIP] = useState('');
  const [status, setStatus] = useState('');
  // 批量安装 更新 卸载
  const [modalVisibleAll, setModalVisibleAll] = useState(false);
  const [modalAllOper, setmodalAllOper] = useState('');
  const [modalContentAll, setModalContentAll] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
  const [width, setWidth] = useState(330);
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
    if (!selMonitor) {
      message.warning(t('请选择监控项！'));
      return;
    }
    if (local_toml == '') {
      message.warning(t('配置文件不能为空，请确认！'));
      return;
    }
    allInstall({ ips: selectedRowKeys, local_toml, name: selMonitor, is_apply }).then(
      (res) => {
        setConfirmLoading(false);
        let text = '配置成功！';
        message.success(t(text));
        setSelMonitor('');
        setlLocal_toml('');
        setBatchDrawer(false);
        get_monitorList();
        if (currentHost.ip) {
          get_monitorListUhost(currentHost.ip);
        }
      },
      (err) => {
        message.error(err);
        setConfirmLoading(false);
        setSelMonitor('');
        setlLocal_toml('');
        setBatchDrawer(false);
      },
    );
  }
  //批量安装/卸载 categraf
  function cate_installAll() {
    let text = '已开始安装，稍后请刷新页面查看...';
    if (modalAllOper == 'UPDATE') {
      text = '批量更新成功！';
    } else if (modalAllOper == 'UNINSTALL') {
      text = '批量卸载成功！';
    }
    cateInstall({ action: modalAllOper, ips: selectedRowKeys }).then(
      (res) => {
        setConfirmLoading(false);
        message.success(t(text));
        setModalVisibleAll(false);
        get_hostList();
      },
      (err) => {
        message.error(err);
        setConfirmLoading(false);
        setHostLoading(false);
        setModalVisibleAll(false);
      },
    );
  }
  //单独安装/卸载 categraf
  function cate_install(action: string, ip: string) {
    const text = translateActionsType(action) + '成功！';
    cateInstall({ action, ips: [ip] }).then(
      (res) => {
        setConfirmLoading(false);
        message.success(t(text));
        get_hostList();
        setIsModalVisible(false);
        setModalContent('');
      },
      (err) => {
        message.error(err);
        setConfirmLoading(false);
        setHostLoading(false);
        setIsModalVisible(false);
        setModalContent('');
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
      case 'DISABLE':
        return '禁用';
      default:
        return val;
    }
  }
  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: RecordType[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(selectedRows);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<RecordType[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: RecordType) => ({
      disabled: !record.port || !record.admin_user || !record.ip, // 当端口 管理信息 ip字段为空时，设置该行不允许被选中
    }),
  };
  // 左侧主机表格
  const columns1: ColumnProps<RecordType>[] = [
    {
      title: t('主机名'),
      dataIndex: 'hostname',
    },
    {
      title: t('IP'),
      dataIndex: 'ip',
      width: 100,
      className: 'ltw_noPaddingColumn',
    },
    {
      title: t('端口'),
      dataIndex: 'port',
      align: 'center',
      width: 60,
      className: 'ltw_noPaddingColumn',
    },
    {
      title: t('管理信息'),
      dataIndex: 'admin_user',
      width: 120,
      align: 'center',
      className: 'ltw_noPaddingColumn',
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      align: 'center',
      width: 60,
      className: 'ltw_noPaddingColumn',
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
        return (
          <Tag color={color} style={{ marginRight: 0 }}>
            {content}
          </Tag>
        );
      },
    },
    {
      title: t('版本'),
      dataIndex: 'version',
      align: 'center',
      width: 100,
      className: 'ltw_noPaddingColumn',
    },
    {
      title: t('table.operations'),
      width: 120,
      align: 'center',
      className: 'ltw_noPaddingColumn',
      render: (_text, record, index) => {
        let status = record.status;
        const actions = record.actions;
        return actions.map((item) => {
          return (
            <a
              className={'ltw_operButton ltw_operButton' + item}
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
            </a>
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
      width: 140,
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      width: 60,
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
      width: 80,
      className: 'ltw_noPaddingColumn',
    },
    {
      title: t('更新时间'),
      dataIndex: 'update_at',
      width: 160,
      className: 'ltw_noPaddingColumn',
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
      width: 150,
      className: 'ltw_noPaddingColumn',
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
      <div className='strategy-content'>
        <Resizable
          style={{
            marginRight: collapse ? 0 : 10,
          }}
          size={{ width: collapse ? 0 : width, height: '100%' }}
          enable={{
            right: collapse ? false : true,
          }}
          onResizeStop={(e, direction, ref, d) => {
            let curWidth = width + d.width;
            if (curWidth < 330) {
              curWidth = 330;
            }
            setWidth(curWidth);
            localStorage.setItem('leftwidth', curWidth.toString());
          }}
        >
          <div className={collapse ? 'left-area collapse' : 'left-area'}>
            <div
              className='collapse-btn'
              onClick={() => {
                localStorage.setItem('leftlist', !collapse ? '1' : '0');
                setCollapse(!collapse);
              }}
            >
              {!collapse ? <LeftOutlined /> : <RightOutlined />}
            </div>

            <div className='ltwminstall_leftArea'>
              <Form layout='inline' className='ltwminstall_leftAreaForm'>
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
                    placeholder='请输入索引值'
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
                <Form.Item label='主机:' className='ltwminstall_leftSelectItem ltwminstall_leftSelectItemHost'>
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
                <Button
                  type='primary'
                  style={{ marginRight: 6 }}
                  onClick={() => {
                    if (!name && !query) {
                      message.warning(t('请至少选中一个监控项或者输入主机名称/IP进行查询操作'));
                      return;
                    }
                    setSelectedRowKeys([]);
                    setHostList([]);
                    setHostLoading(true);
                    get_hostList();
                  }}
                >
                  {t('查询')}
                </Button>
                <Form.Item label='状态:' className='ltwminstall_leftSelectItem'>
                  <Select
                    onChange={(value: string) => {
                      setStatus(value);
                      setSelectedRowKeys([]);
                    }}
                    allowClear
                    placeholder='请选择状态'
                    style={{ width: 130 }}
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
                </Form.Item>

                <Button
                  type='primary'
                  style={{ marginRight: 6 }}
                  onClick={() => {
                    if (selectedRowKeys.length == 0) {
                      message.warning(t('未选择任何主机，请选择!'));
                      return;
                    }
                    let content = '确定要在  ';
                    const arrLength = selectedRowKeys.length;
                    selectedRows.forEach((ele, index) => {
                      if (index != arrLength - 1) {
                        content += ele.hostname + ',';
                      } else {
                        content += ele.hostname;
                      }
                    });
                    content += '  上安装categraf服务？';
                    setModalContentAll(content);
                    setmodalAllOper('INSTALL');
                    setModalVisibleAll(true);
                  }}
                >
                  {t('批量安装')}
                </Button>
                <Button
                  type='primary'
                  style={{ marginRight: 6 }}
                  className='ltwButtonUpdate'
                  onClick={() => {
                    if (selectedRowKeys.length == 0) {
                      message.warning(t('未选择任何主机，请选择!'));
                      return;
                    }
                    let content = '确定要更新 ';
                    const arrLength = selectedRowKeys.length;
                    selectedRows.forEach((ele, index) => {
                      if (index != arrLength - 1) {
                        content += ele.hostname + ',';
                      } else {
                        content += ele.hostname;
                      }
                    });
                    content += '   上的categraf服务？';
                    setModalContentAll(content);
                    setmodalAllOper('UPDATE');
                    setModalVisibleAll(true);
                  }}
                >
                  {t('批量更新')}
                </Button>
                <Button
                  type='primary'
                  className='ltwButtonSetting'
                  onClick={() => {
                    if (selectedRowKeys.length == 0) {
                      message.warning(t('未选择任何主机，请选择!'));
                      return;
                    }
                    setBatchDrawer(true);
                  }}
                >
                  {t('批量配置')}
                </Button>
                {/* <Button
                type='primary'
                danger
                onClick={() => {
                  if (selectedRowKeys.length == 0) {
                    message.warning(t('未选择任何主机，请选择!'));
                    return;
                  }
                  let content = '确定要卸载  ';
                  selectedRowKeys.forEach((ele) => {
                    content += ele;
                  });
                  content += '   上的categraf服务？';
                  setModalContentAll(content);
                  setmodalAllOper('UNINSTALL');
                  setModalVisibleAll(true);
                }}
              >
                {t('批量卸载')}
              </Button> */}
              </Form>
              <Spin spinning={hostLoading} delay={200}>
                <div className='ltwminstall_leftAreaList'>
                  <Table
                    rowKey={(record) => record.ip}
                    columns={columns1}
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
                    rowSelection={rowSelection}
                  />
                </div>
              </Spin>
            </div>
          </div>
        </Resizable>

        <div className='ltwminstall_rightArea'>
          <Spin spinning={tableLoading} delay={200}>
            <Table
              rowKey={(record) => record.name}
              columns={columns2}
              dataSource={tableProps}
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

        {/* 单独配置 */}
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
                <div className='ltwminstall_drawerSelectContent' style={{ width: '1000px' }}>
                  <DiffEditor
                    readOnly={false}
                    newValue={localConf}
                    oldValue={serverConf}
                    height='800px'
                    width='1000px'
                    onChange={(values) => {
                      setLocalConf(values[1]);
                    }}
                  />
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
        {/* 单独 安装、更新、卸载 categraf */}
        <Modal
          title='提示'
          visible={isModalVisible}
          confirmLoading={confirmLoading}
          onOk={() => {
            setConfirmLoading(true);
            setHostLoading(true);
            cate_install(action, ip);
          }}
          onCancel={() => {
            setIsModalVisible(false);
            setModalContent('');
          }}
        >
          <p>{modalContent}</p>
        </Modal>
        {/* 批量 安装、更新、卸载 categraf */}
        <Modal
          title='提示'
          visible={modalVisibleAll}
          confirmLoading={confirmLoading}
          onOk={() => {
            setConfirmLoading(true);
            setHostLoading(true);
            cate_installAll();
          }}
          onCancel={() => {
            setModalVisibleAll(false);
            setModalContentAll('');
          }}
        >
          <p>{modalContentAll}</p>
        </Modal>
        {/* 批量配置 */}
        <Modal
          title='批量配置监控'
          visible={batchDrawer}
          width='900px'
          confirmLoading={confirmLoading}
          onOk={() => {
            setConfirmLoading(true);
            all_install(true);
          }}
          onCancel={() => {
            setSelMonitor('');
            setlLocal_toml('');
            setBatchDrawer(false);
          }}
        >
          <div className='ltwminstall_modalArea'>
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
              <div className='ltwminstall_drawerSelectContent ' style={{ width: '700px' }}>
                <Editor value={local_toml} height='55vh' readOnly={false} onChange={(value) => setlLocal_toml(value)} />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </PageLayout>
  );
};
export default index;
