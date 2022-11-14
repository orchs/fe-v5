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
import PageLayout from '@/components/pageLayout';
import { useHistory } from 'react-router-dom';
import RightTable from './RightTable';
import { LeftOutlined, RightOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './index.less';
import { useQuery } from '@/utils';
import { Button, Input, List } from 'antd';
import { ActionType, Team } from '@/store/manageInterface';
import { getTeamInfoList } from '@/services/manage';
import { Resizable } from 're-resizable';
import _ from 'lodash';
import UserInfoModal from '../../user/component/createModal';

const orderManage: React.FC = () => {
  const urlQuery = useQuery();
  const history = useHistory();
  const id = urlQuery.get('id');
  const { t } = useTranslation();
  const [teamId, setTeamId] = useState<string>('');
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [memberId, setMemberId] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  // const [activeKey, setActiveKey] = useState<UserType>(UserType.Team);
  const [action, setAction] = useState<ActionType>();
  const [searchValue, setSearchValue] = useState<string>('');
  const [collapse, setCollapse] = useState(localStorage.getItem('leftlist') === '1');
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('leftwidth') || 200));
  const busiChange = (id) => {
    history.push(`/work/orderManage?id=${id}`);
  };
  useEffect(() => {
    getList(true);
  }, []); //teamId变化触发

  const getList = (isDeleteOrAdd = false) => {
    getTeamList('', isDeleteOrAdd);
  };

  // 获取团队列表
  const getTeamList = (search?: string, isDelete?: boolean) => {
    getTeamInfoList({ query: search || '' }).then((data) => {
      setTeamList(data.dat || []);
      if ((!teamId || isDelete) && data.dat.length > 0) {
        setTeamId(data.dat[0].id);
      }
    });
  };

  const handleClick = (type: ActionType, id?: string, memberId?: string) => {
    if (id) {
      setTeamId(id);
    } else {
      setTeamId('');
    }

    if (memberId) {
      setMemberId(memberId);
    } else {
      setMemberId('');
    }

    setAction(type);
    setVisible(true);
  };

  return (
    <PageLayout title={t('排班管理')} icon={<SettingOutlined />} hideCluster>
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
            if (curWidth < 200) {
              curWidth = 200;
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
            <div className='ltwWorkforceTopArea group-shrink'>
              <div className='sub-title'>
                {t('团队列表')}
                {/* <Button
                  style={{
                    height: '30px',
                  }}
                  size='small'
                  type='link'
                  onClick={() => {
                    handleClick(ActionType.CreateTeam);
                  }}
                >
                  {t('新建团队')}
                </Button> */}
              </div>
              <div style={{ display: 'flex', margin: '5px 0px 12px' }}>
                <Input
                  prefix={<SearchOutlined />}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                  placeholder={t('搜索团队名称')}
                  onPressEnter={(e) => {
                    // @ts-ignore
                    getTeamList(e.target.value);
                  }}
                  onBlur={(e) => {
                    // @ts-ignore
                    getTeamList(e.target.value);
                  }}
                />
              </div>
              <List
                style={{
                  marginBottom: '12px',
                  flex: 1,
                  overflow: 'auto',
                }}
                className='ltwWorkforceList'
                dataSource={teamList}
                size='small'
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    className={teamId === item.id ? 'is-active' : ''}
                    onClick={() => {
                      setTeamId(item.id);
                    }}
                  >
                    {item.name}
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Resizable>
        <RightTable bgid={Number(teamId)}></RightTable>
        {/* <UserInfoModal
          visible={visible}
          action={action as ActionType}
          width={500}
          userType={activeKey}
          onClose={handleClose}
          onSearch={(val) => {
            setSearchValue(val);
            handleSearch('team', val);
          }}
          userId={userId}
          teamId={teamId}
          memberId={memberId}
        /> */}
      </div>
    </PageLayout>
  );
};

export default orderManage;
