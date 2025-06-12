const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/recommend', async (req, res) => {
  const { teamname } = req.body;

  if (!teamname) {
    return res.status(400).json({ error: 'teamname 파라미터가 필요합니다.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // ✅ GPT-4 모델 명시
      messages: [
        {
          role: 'system',
          content: '당신은 야구팀 기반으로 닉네임을 추천해주는 도우미입니다.',
        },
        {
          role: 'user',
          content: `${teamname} 응원팀 팬에게 어울리는 짧고 인상적인 닉네임을 3개만 추천해줘. 숫자나 특수기호는 제외한 한글 닉네임으로, 너무 유치하지 않게, 해당 야구팀의 특색에 맞게 추천해 ex) ssg랜더스 : 홈런공장, output은 추천 닉네임 3개, 응원팀이 없다면 랜덤닉네임으로` ,
        },
      ],
    });

    const suggestions = response.choices?.[0]?.message?.content
      ?.split('\n')
      ?.filter(Boolean)
      ?.map((line) => line.replace(/^[0-9]+[\).]?\s*/, '').trim());

    res.json({ nicknames: suggestions });
  } catch (error) {
    console.error('OpenAI 닉네임 추천 오류:', error);
    res.status(500).json({ error: '닉네임 추천 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
