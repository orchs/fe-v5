import React, { useState, useRef, useEffect } from "react";
import Editor from "../editor";
import { Table, Row, Col, Input, Button, Select, Drawer, Form, Tag, Spin, message } from "antd";
import { SearchOutlined, BookOutlined, ReloadOutlined } from "@ant-design/icons";
import { ColumnProps } from "antd/lib/table";
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/pageLayout";
import { logItem } from "../interface";
import { getHostList, getMonitorList, getLogList } from "@/services/categraf";
import "./index.less";
import { useAntdTable } from "ahooks";
import { pageSizeOptions } from "@/components/Dantd/components/data-table/config";

const index = (_props: any) => {
  const { Option } = Select;
  const { t, i18n } = useTranslation();
  const [hostList, setHostList] = useState([] as any[]);
  const searchRef = useRef<Input>(null);
  // const [tableProps, setTableProps] = useState([] as any[]);
  const [monitorList, setMonitorList] = useState([] as any[]);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [status, setStatus] = useState("");
  const [freshFlag, setFreshFlag] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [detail, setDetail] = useState({
    hostname: "",
    status: "",
    message: "",
    stand_out: "",
    update_by: "",
    update_at: 0,
    last_toml: "",
    current_toml: "",
  });
  const [hostLoading, setHostLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPageSize, setCurrentPageSize] = useState("1");
  const [currentPage, setCurrentPage] = useState("15");
  const [totalNum, setTotalNum] = useState("");
  function get_monitorList() {
    getMonitorList().then(
      (res) => {
        if (res.success) {
          let monitorsArr: string[] = [];
          const arr = res.dat;
          arr.forEach((ele) => {
            monitorsArr.push(ele.name);
          });
          setMonitorList(monitorsArr);
        }
      },
      (err) => {
        message.error(err);
      }
    );
  }
  function get_hostList(query: string) {
    getHostList({ query }).then(
      (res) => {
        setHostList(res.dat.list);
        setHostLoading(false);
      },
      (err) => {
        message.error(err);
        setHostLoading(false);
      }
    );
  }
  const featchData = ({ current, pageSize }): Promise<any> => {
    const query = { name, ip, status, limit: pageSize, p: current };
    return getLogList(query).then((res) => {
      setTableLoading(false);
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };
  const showTotal = (total: number) => {
    return `共 ${total} 条`;
  };
  const { tableProps } = useAntdTable(featchData, {
    refreshDeps: [name, ip, status,freshFlag],
    defaultPageSize: 15,
  });
  function get_logList(ips?: string, monitorName?: string, statusText?: string) {
    // let data_ip = ips;
    // if (!data_ip) {
    //   data_ip = ip;
    // }
    getLogList({ name: monitorName, ip: ips, status: statusText, p: currentPage, limit: currentPageSize }).then(
      (res) => {
        // setTableProps(res.dat.list);
        setTableLoading(false);
        setTotalNum(res.dat.total);
      },
      (err) => {
        message.error(err);
        setTableLoading(false);
      }
    );
  }
  useEffect(() => {
    get_monitorList();
    // get_logList();
  }, []);
  const columns: ColumnProps<logItem>[] = [
    {
      title: t("监控类型"),
      dataIndex: "name",
      className: "minWidth",
      width: 100,
    },
    {
      title: t("主机名"),
      dataIndex: "hostname",
      width: 280,
    },
    {
      title: t("IP"),
      dataIndex: "ip",
      width: 160,
    },
    {
      title: t("状态"),
      dataIndex: "status",
      width: 80,
      render: (text, record, index) => {
        // 参数分别为当前行的值，当前行数据，行索引
        let color = "#2db7f5";
        if (text == "succeed") {
          color = "#87d068";
        } else if (text == "failed") {
          color = "#f50";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t("执行人"),
      dataIndex: "update_by",
    },
    {
      title: t("执行时间"),
      dataIndex: "update_at",
      width: 160,
      defaultSortOrder: "descend",
      sorter: (a, b) => a.update_at - b.update_at,
      render: (text) => {
        return moment.unix(text).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: t("table.operations"),
      width: 120,
      render: (_text, record) => {
        return (
          <span>
            <a
              style={{ color: "#40a9ff" }}
              onClick={() => {
                setDetail({
                  hostname: record.hostname,
                  status: record.status,
                  update_by: record.update_by,
                  update_at: record.update_at,
                  message: record.message,
                  stand_out: record.stand_out,
                  last_toml: record.last_toml,
                  current_toml: record.current_toml,
                });
                setDetailDrawer(true);
              }}
            >
              {t("查看详情")}
            </a>
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
          <BookOutlined />
          {t("categraf管理/操作日志")}
        </>
      }
    >
      <div style={{ display: "flex" }}>
        <div className="ltwmoper_leftArea">
          <div className="ltwmoper_inputArea">
            <span className="ltwmoper_inputLable">主机:</span>
            <Input
              ref={searchRef}
              prefix={<SearchOutlined />}
              onPressEnter={(e) => {
                if (!e.currentTarget.value) {
                  message.warning("请输入主机名称或IP进行查询");
                  return;
                }
                setHostLoading(true);
                setHostList([]);
                get_hostList(e.currentTarget.value);
                setIp("");
              }}
              placeholder="请输入主机名称查询"
              allowClear
            />
          </div>
          <Spin spinning={hostLoading} delay={200}>
            <div className="ltwmoper_leftAreaList">
              {hostList.map((item, index) => (
                <div
                  className={`ltwmoper_leftListItem ${item.ip == ip ? "active" : ""}`}
                  key={index}
                  onClick={() => {
                    setTableLoading(true);
                    if (ip != item.ip) {
                      setIp(item.ip);
                      // get_logList(item.ip, name, status);
                    } else {
                      setIp("");
                      // get_logList("", name, status);
                    }
                  }}
                >
                  {item.hostname}
                </div>
              ))}
            </div>
          </Spin>
        </div>
        <div className="ltwmoper_rightArea">
          <Row>
            <Col span={20}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setFreshFlag(!freshFlag)
                  // setTableLoading(true);
                  // getLogList({ name: name, ip: ip, status: status }).then(
                  //   (res) => {
                  //     // setTableProps(res.dat.list);

                  //     setTableLoading(false);
                  //   },
                  //   (err) => {
                  //     message.error(err);
                  //     setTableLoading(false);
                  //   }
                  // );
                }}
              />
              <Select
                onChange={(value: string) => {
                  setTableLoading(true);
                  setName(value);
                  // get_logList(ip, value, status);
                }}
                allowClear
                showSearch
                placeholder="请选择监控类型"
                style={{ width: 200, marginLeft: 8 }}
              >
                {monitorList.map((item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
              <Select
                onChange={(value: string) => {
                  setTableLoading(true);
                  setStatus(value);
                  // get_logList(ip, name, value);
                }}
                allowClear
                showSearch
                placeholder="请选择状态"
                style={{ width: 200, marginLeft: 8 }}
              >
                <Option key="failed" value="failed">
                  failed
                </Option>
                <Option key="succeed" value="succeed">
                  succeed
                </Option>
              </Select>
            </Col>
          </Row>
          <Spin spinning={tableLoading} delay={200}>
            <Table
              rowKey="id"
              columns={columns}
              {...tableProps}
              pagination={
                {
                  ...tableProps.pagination,
                  // pageSizeOptions,
                  showTotal: showTotal,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  defaultPageSize: 15,
                  // showSizeChanger: true,
                  pageSizeOptions: ["15", "50", "100", "500", "1000"],
                  // total: { total1 },
                  onChange: (page, pageSize) => {
                    setCurrentPage(page);
                    setCurrentPageSize(pageSize);
                    // get_logList(ip,name,status,page, pageSize)
                  }, //点击页码事件
                  // showTotal: (total) => {
                  //   return i18n.language == "en" ? `Total ${totalNum} items` : `共 ${totalNum} 条`;
                  // },
                } as any
              }
            />
          </Spin>
        </div>
        <Drawer
          title={"详情"}
          placement="right"
          onClose={() => {
            setDetailDrawer(false);
          }}
          visible={detailDrawer}
          width={1000}
        >
          <Form>
            <Form.Item label="主机：">
              <Tag color="green" style={{ lineHeight: "32px" }}>
                {detail.hostname}
              </Tag>
            </Form.Item>
            <Form.Item label="状态：">
              <Tag color={detail.status == "succeed" ? "#87d068" : detail.status == "failed" ? "#f50" : "#2db7f5"}>
                {detail.status}
              </Tag>
            </Form.Item>
            <Form.Item label="信息：">
              <span>{detail.message}</span>
            </Form.Item>
            <Form.Item label="标准输出：">
              <span>{detail.stand_out}</span>
            </Form.Item>
            <Form.Item label="执行人：">
              <span>{detail.update_by}</span>
            </Form.Item>
            <Form.Item label="执行时间；">
              <span>{detail.update_at ? moment.unix(detail.update_at).format("YYYY-MM-DD HH:mm:ss") : ""}</span>
            </Form.Item>
            <Form.Item label="配置信息："></Form.Item>
            <Form.Item label="历史配置：" className="ltw_operInlineItem">
              <Editor value={detail.last_toml} readOnly={true} height="500px" />
            </Form.Item>
            <Form.Item label="当前配置：" className="ltw_operInlineItem">
              <Editor value={detail.current_toml} readOnly={true} height="500px" />
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    </PageLayout>
  );
};
export default index;
