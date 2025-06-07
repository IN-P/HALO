import React, { useEffect} from "react";
import { BulbFilled } from "@ant-design/icons";
import { Card, Button, Checkbox } from "antd";

import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import useToggle from "../../hooks/useToggle";

const MyMain = ({ data, isMyProfile, loginUser }) => {
  // c

  
  const [checked, toggleChecked, setChecked] = useToggle(true);
  const [disabled, toggleDisabled] = useToggle(false);

  const onChange = (e) => {
    console.log('checked = ', e.target.checked);
    setChecked(e.target.checked);
  };

  const label = `${checked ? 'Checked' : 'Unchecked'}-${disabled ? 'Disabled' : 'Enabled'}`;

  // v
  return (
    <div style={{ width: '25%'}}>
      <div style={{ paddingBottom: "10px", display: 'flex', marginTop: '5%'  }}>
        <span style={{ fontSize: "22px", fontWeight: "bold" }}>
          {data?.nickname}
        </span>
        <span style={{ fontSIze: "16px", color: "#9F9F9F" }}>
          &nbsp;{data?.role||""}
        </span>
        {loginUser && !isMyProfile && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginLeft: '3%', verticalAlign: 'middle', }}>
          <Button type="primary" size="small" onClick={toggleChecked}>
            {!checked ? '언팔로우' : '팔로우'}
          </Button>
          <Button type="error" size="small" onClick={toggleDisabled}>
            {!disabled ? '차단' : '해제'}
          </Button>
        </span>
      )}
      </div>
      <div>
        <BulbFilled style={{ color: "orange", fontSize: "20px" }} /> {data?.Achievements}
      </div>
      <div style={{ display: "flex", justifyContent: 'space-around', height: "120px", paddingTop: '5%' }}>
        <span>게시글 {data && Array.isArray(data.Posts) ? data.Posts.length : 0}</span>       
        <span>팔로우 {data?.Followers ?? 0}</span>
        <span>팔로잉 {data?.Followings ?? 0}</span>
      </div>
      <div style={{ maxWidth: "400px" }}>
        <p style={{ wordBreak: "break-word" }}>
          {data?.UserInfo?.introduce}
        </p>
      </div>
    </div>
  );
};
export default MyMain;
