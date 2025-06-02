import React, { useState } from "react";
import { Col, Row } from "antd";
import AppLayout from "../components/AppLayout";
import MySetting from "../components/mypage/MySetting";
import MyAvatar from "../components/mypage/MyAvatar";

const myset = () => {
  return (
    <AppLayout>
      <Row>
        <Col span={12}>col-12</Col>
        <Col span={12}>col-12</Col>
      </Row>
    </AppLayout>
  );
};

export default myset;
