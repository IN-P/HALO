// 멤버십 기본값 넣어주기

const db = require('../../models');

module.exports = async () => {
  const memberships = [
    { id: 1, name: '기본', price: 0 },
    { id: 2, name: 'silver', price: 0 },
    { id: 3, name: 'gold', price: 5000 },
    { id: 4, name: 'vvip', price: 100000 },
  ];

  const MembershipModel = db.sequelize.modelManager.models.find(
    (model) =>
      model.name?.toLowerCase() === 'membership' ||
      model.tableName?.toLowerCase() === 'memberships'
  );

  if (!MembershipModel) {
    console.error(' memberships 테이블에 해당하는 모델을 찾을 수 없습니다.');
    return;
  }

  for (const m of memberships) {
    try {
      await MembershipModel.findOrCreate({
        where: { id: m.id },
        // defaults: m, // 이렇게 하면 여전히 price만 필요한데 id, name까지 다 들어가서 warning을 낼 수 있습니다.
        defaults: { // 명시적으로 필요한 속성만 전달합니다.
          name: m.name,
          price: m.price,
        },
      });
      console.log(`[MEMBERSHIP] ${m.name} 등록 완료`);
    } catch (err) {
      console.error(`[MEMBERSHIP ERROR] ${m.name}`, err);
    }
  }
};