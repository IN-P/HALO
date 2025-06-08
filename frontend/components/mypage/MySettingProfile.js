import MyAvatar from "./MyAvatar";
import MySettingEditForm from "./MySettingEditForm";


const MySettingProfile = ({ data, reload }) => {
  return (
      <>
          <div style={{ display: "flex", justifyContent: "center", padding: "5% 0 5% 0" }}>
      <MyAvatar data={data} />
      </div>
      <div>
      <MySettingEditForm data={data} reload={reload} /> 
      </div>
      </>
  );
};

export default MySettingProfile;
