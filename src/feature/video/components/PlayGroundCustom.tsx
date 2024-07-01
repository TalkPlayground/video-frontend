import { Image, Modal, Table, Tabs } from 'antd';
import TabPane from 'antd/lib/tabs/TabPane';
import { useState } from 'react';
import './playGroundCustom.scss';

const PlayGroundCustom = (props: any) => {
  const { visible, setVisible } = props;
  const [tab, setTab] = useState('core');

  const onTabChange = (key: string) => {
    setTab(key);
  };
  return (
    <Modal
      open={visible}
      onCancel={() => setVisible(false)}
      destroyOnClose
      className="playgroundModal"
      footer={null}
      // title="Talk Playground Statistic"
    >
      <div className="talkPlaygroundModal">
        <Tabs onChange={onTabChange} type="card" activeKey={tab} size="large">
          <TabPane tab="Core" key="core">
            <div className="img-container">
              <Image src="img/core.svg" />
            </div>
          </TabPane>
          <TabPane tab="Primary" key="primary">
            <div className="img-container">
              <Image src="img/primary.svg" />
            </div>
          </TabPane>
          <TabPane tab="Secondary" key="secondary">
            <div className="img-container">
              <Image src="img/secondary.svg" />
            </div>
          </TabPane>
          <TabPane tab="Positive Self-Regard" key="positive">
            <div className="img-container">
              <Image src="img/positive.svg" />
            </div>
          </TabPane>
          <TabPane tab="Expression Resistant" key="expression">
            <div className="img-container">
              <Image src="img/resistant.svg" />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default PlayGroundCustom;
