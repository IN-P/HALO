import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import MySettingSidebar from "./MySettingSidebar";
import MyHeader from "./MyHeader";
import MyAvatar from "./MyAvatar";
import MySettingEditForm from "./MySettingEditForm";
import { CloseOutlined } from '@ant-design/icons';
import { MySettingBlock } from './MySettingBlock';
import { useDispatch, useSelector } from "react-redux";

const MySettingPopUp = ({ data, onClose }) => {

  useEffect(() => {
    const removePadding = document.getElementById("mainContents");
    const removeMembership = document.getElementById("membership");
    const removeShare = document.getElementById("share");

    if (removePadding) { removePadding.style.padding = "0"; }
    if (removeMembership) { removeMembership.style.display = "none"; }
    if (removeShare) { removeShare.style.display = "none"; }
  }, []);

  const [blockList, setBlockList] = useState(false);

  return (
    <div>
      <Row style={{ height: "100vh", overflow: "hidden" }}>
        <Col
          span={6}
          style={{
            height: "100vh",
            backgroundColor: "#fafafa",
            borderRight: "1px solid #e0e0e0",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <MySettingSidebar />
        </Col>
        <Col
          span={18}
          style={{
            height: "100vh",
            overflowY: "auto",
            backgroundColor: "#fff",
          }}
        >
          {/*
            <div>
              <div style={{ display: "flex", justifyContent: "end", padding: "1% 1% 0 0" }}>
                <span style={{ fontSize: "20px", cursor: "pointer", marginLeft: "12px" }} onClick={onClose} ><CloseOutlined /></span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", padding: "5% 0 5% 0" }}>
                <MyAvatar data={data} />
              </div>
              <div>
                <MySettingEditForm data={data} />
              </div>
            </div>
*/}
        </Col>
      </Row>
    </div>
  );
};

export default MySettingPopUp;