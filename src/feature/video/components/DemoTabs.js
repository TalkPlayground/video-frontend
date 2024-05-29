import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import SwipeableViews from 'react-swipeable-views';
import { Typography } from 'antd';
import { Box } from '@mui/material';

const styles = {
  tabs: {
    background: '#fff',
    width: '100vw',
    textTransform: 'none'
  },

  slide: {
    padding: 15,
    minHeight: 100,
    color: '#fff'
  },
  slide1: {
    backgroundColor: '#FEA900'
  },
  slide2: {
    backgroundColor: '#B3DC4A'
  },
  slide3: {
    backgroundColor: '#6AC0FF'
  }
};

class DemoTabs extends React.Component {
  state = {
    index: 0
  };

  handleChange = (event, value) => {
    this.setState({
      index: value
    });
  };

  handleChangeIndex = (index) => {
    this.setState({
      index
    });
  };

  render() {
    const { index } = this.state;

    return (
      <div>
        <Box>
          <Typography>All About this Call</Typography>
        </Box>
        <Tabs value={index} onChange={this.handleChange} style={styles.tabs}>
          <Tab label="People" />
          <Tab label="Info" />
          <Tab label="Chat" />
        </Tabs>
        <SwipeableViews index={index} onChangeIndex={this.handleChangeIndex}>
          <div style={Object.assign({}, styles.slide, styles.slide1)}>slide n°1</div>
          <div style={Object.assign({}, styles.slide, styles.slide2)}>
            slide n°2
            <Select value={10} autoWidth={false}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
            </Select>
          </div>
          <div style={Object.assign({}, styles.slide, styles.slide3)}>slide n°3</div>
        </SwipeableViews>
      </div>
    );
  }
}

export default DemoTabs;
