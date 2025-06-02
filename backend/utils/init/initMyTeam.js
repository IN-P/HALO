// 응원팀 기본값 넣어주기

const db = require('../../models');

module.exports = async () => {
  const teams = [
    { id: 1, name: '응원팀 없음', color: '', region: '' }, // 기본값 설정
    { id: 2, name: '기아 타이거즈', color: 'red', region: '광주' },
    { id: 3, name: '삼성 라이온즈', color: 'blue', region: '대구' },
    { id: 4, name: 'LG 트윈스', color: 'black', region: '서울' },
    { id: 5, name: '두산 베어스', color: 'darkblue', region: '서울' },
    { id: 6, name: 'KT 위즈', color: 'black', region: '수원' },
    { id: 7, name: 'SSG 랜더스', color: 'red', region: '인천' },
    { id: 8, name: '롯데 자이언츠', color: 'red', region: '부산' },
    { id: 9, name: '한화 이글스', color: 'orange', region: '대전' },
    { id: 10, name: 'NC 다이노스', color: 'navy', region: '창원' },
    { id: 11, name: '키움 히어로즈', color: 'red', region: '서울' },
  ];

  const MyTeamModel = db.sequelize.modelManager.models.find(
    (model) =>
      model.name?.toLowerCase() === 'myteam' ||
      model.tableName?.toLowerCase() === 'myteams'
  );

  if (!MyTeamModel) {
    console.error(' myteams 테이블에 해당하는 모델을 찾을 수 없습니다.');
    return;
  }

  for (const team of teams) {
    try {
      await MyTeamModel.findOrCreate({
        where: { id: team.id },
        // defaults 객체를 Myteam 모델의 필수 컬럼에 맞게 수정합니다.
        defaults: {
          teamname: team.name,    // 'name' 대신 'teamname'으로 변경 (모델 컬럼명에 따라)
          teamcolor: team.color,  // 'color' 정보 추가
          region: team.region,    // 'region' 정보 추가
        },
      });
      console.log(`[MYTEAM] ${team.name} 등록 완료`);
    } catch (err) {
      console.error(`[MYTEAM ERROR] ${team.name}`, err);
    }
  }
};