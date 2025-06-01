import React, { useState } from "react";
import { Row, Col, Divider } from "antd";
import AppLayout from "../components/AppLayout";
import MySetting from "../components/mypage/MySetting";
import MyAvatar from "../components/mypage/MyAvatar";

const myset = () => {
  return (
    <AppLayout>
      <Divider orientation="left">Percentage columns</Divider>
      <Row>
        <Col flex={2}>2 / 5</Col>
        <Col flex={3}>3 / 5</Col>
      </Row>
    </AppLayout>
  );
};

export default myset;
