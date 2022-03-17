import React from 'react';
import _ from 'lodash';
import { Dropdown, Menu, Tooltip } from 'antd';
import { InfoOutlined, DownOutlined, LinkOutlined, SettingOutlined, ShareAltOutlined, DeleteOutlined } from '@ant-design/icons';
import { Range } from '@/components/DateRangePicker';
import Timeseries from './Timeseries';
import Stat from './Stat';
import Table from './Table';
import { VariableType } from '../../VariableConfig';
import Markdown from '../../Editor/Components/Markdown';
import { IPanel } from '../../types';
import './style.less';

interface IProps {
  time: Range;
  step: number | null;
  type: string;
  values: IPanel;
  variableConfig?: VariableType;
  isPreview?: boolean; // 是否是预览，预览中不显示编辑和分享
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function index(props: IProps) {
  const { time, step, type, variableConfig, values, isPreview, onEditClick, onDeleteClick } = props;
  const subProps = {
    time,
    step,
    variableConfig,
    values,
  };
  if (_.isEmpty(values)) return null;
  const RendererCptMap = {
    timeseries: <Timeseries {...subProps} />,
    stat: <Stat {...subProps} />,
    table: <Table {...subProps} />,
  };
  return (
    <div className='renderer-container'>
      <div className='renderer-header'>
        {values.description ? (
          <Tooltip placement='rightTop' title={<Markdown content={values.description} />}>
            <div className='renderer-header-desc'>
              <InfoOutlined />
            </div>
          </Tooltip>
        ) : null}
        <div className='renderer-header-content'>
          <Dropdown
            trigger={['click']}
            placement='bottomCenter'
            overlayStyle={{
              minWidth: '100px',
            }}
            overlay={
              <Menu>
                {values.link ? (
                  <Menu.Item>
                    <a href={values.link} target='_blank'>
                      <LinkOutlined />
                      下钻链接
                    </a>
                  </Menu.Item>
                ) : null}
                {!isPreview ? (
                  <>
                    <Menu.Item onClick={onEditClick}>
                      <SettingOutlined />
                      编辑
                    </Menu.Item>
                    <Menu.Item disabled>
                      <ShareAltOutlined />
                      分享
                    </Menu.Item>
                    <Menu.Item onClick={onDeleteClick}>
                      <DeleteOutlined />
                      删除
                    </Menu.Item>
                  </>
                ) : null}
              </Menu>
            }
          >
            <div className='renderer-header-title'>
              {values.name}
              <DownOutlined className='renderer-header-arrow' />
            </div>
          </Dropdown>
        </div>
      </div>
      <div style={{ height: `calc(100% - 36px)` }}>{RendererCptMap[type] || `无效的图表类型 ${type}`}</div>
    </div>
  );
}

export default index;
