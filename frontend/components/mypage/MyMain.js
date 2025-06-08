import React, { useEffect} from "react";
import { BulbFilled, SafetyOutlined  } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

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
      <div style={{ paddingBottom: "10px", display: 'flex', alignItems: 'center', marginTop: '5%' }}>
        <span 
          style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            whiteSpace: "nowrap", 
            overflow: "hidden", 
            textOverflow: "ellipsis", 
            maxWidth: "70%" 
          }}
          title={data?.nickname}
        >
          {data?.nickname}
        </span>
        <span 
          style={{ 
            fontSize: "16px", 
            color: "#9F9F9F", 
            marginLeft: "10px", 
            whiteSpace: "nowrap" 
          }}
        >
          {data?.role || ""}
        </span>
        {loginUser && !isMyProfile && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', verticalAlign: 'middle' }}>
            <Button type="primary" size="small" onClick={toggleChecked}>
              {!checked ? '언팔로우' : '팔로우'}
            </Button>
            <Button type="error" size="small" onClick={toggleDisabled}>
              {!disabled ? '차단' : '해제'}
            </Button>
          </span>
        )}
      </div>

      {/* 업적의 수 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px',    // 두 그룹 사이 넓은 간격 
        marginTop: '0.1%', 
        marginBottom: '0.1%',
        fontSize: '22px' // 전체 기본 폰트 크기 키움
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tooltip title="달성한 업적">
            <BulbFilled style={{ color: "orange", cursor: 'pointer' }} />
          </Tooltip>
          <span style={{ fontWeight: '700', color: '#555', fontSize: '24px' }}>
            {data?.Achievements?.length ?? 0}
          </span>
        </div>
        {/* 뱃지의 수 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tooltip title="보유한 뱃지">
            <SafetyOutlined style={{ color: "red", cursor: 'pointer' }} />
          </Tooltip>
          <span style={{ fontWeight: '700', color: '#555', fontSize: '24px' }}>
            {data?.Badges?.length ?? 0}
          </span>
        </div>
      </div>

      {/* 게시글 / 팔로우 / 팔로잉 수 표시 */}
      <div style={{ 
          display: "flex", 
          justifyContent: 'space-around', 
          alignItems: 'center', 
          gap: '30px', 
          paddingTop: '5%', 
          fontSize: '16px', 
          color: '#444' 
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '700', fontSize: '20px', color: '#1890ff' }}>
            {data && Array.isArray(data.Posts) ? data.Posts.length : 0}
          </div>
          <div>게시글</div>
        </div>
        
        {/* 팔로우 수 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '700', fontSize: '20px', color: '#1890ff' }}>
            {Array.isArray(data?.Followers) ? data.Followers.length : 0}
          </div>
          <div>팔로우</div>
        </div>

        {/* 팔로잉 수 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '700', fontSize: '20px', color: '#1890ff' }}>
            {Array.isArray(data?.Followings) ? data.Followings.length : 0}
          </div>
          <div>팔로잉</div>
        </div>
      </div>
<div style={{ maxWidth: "400px", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px", marginTop: "16px" }}>
  <p style={{ 
    wordBreak: "break-word",
    lineHeight: "1.6",
    fontSize: "16px",
    color: "#333",
    margin: 0
  }}>
    {data?.UserInfo?.introduce}
  </p>
</div>
    </div>
  );
};
export default MyMain;
