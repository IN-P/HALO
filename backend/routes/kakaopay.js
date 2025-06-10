// routes/kakaopay.js
const express = require('express');
const axios = require('axios');
const { UserPayment, User } = require('../models');
const { SUCCESS, CANCEL, FAIL } = require('../utils/pay/paymentStatus');
const router = express.Router();

// 카카오페이 관리자 키 (운영 시 환경변수로 관리하세요)
const SECRET_KEY = 'DEV18DA3165ABDEF8C8FC3F9B092F335D1E8ED23';
// 테스트용 CID
const CID = 'TC0ONETIME';

// 1) 결제 준비 요청
// POST /pay/ready
router.post('/ready', async (req, res) => {
  try {
    const { userId, amount } = req.body;  // 프론트에서 { userId, amount } 보내야 함

    const apiResponse = await axios.post(
      'https://open-api.kakaopay.com/online/v1/payment/ready',
      {
        cid: CID,
        partner_order_id: `halo_order_${Date.now()}`,
        partner_user_id: userId.toString(),
        item_name: 'Halo 포인트 충전',
        quantity: 1,
        total_amount: amount,
        vat_amount: 0,
        tax_free_amount: 0,
        // success 쿼리파라미터에 tid는 실제 응답에서 받아서 교체하세요
        approval_url: `http://localhost:3065/pay/success?userId=${userId}&amount=${amount}&tid=TID_PLACEHOLDER`,
        cancel_url: `http://localhost:3065/pay/cancel`,
        fail_url: `http://localhost:3065/pay/fail`,
      },
      {
        headers: {
          Authorization: `SECRET_KEY ${SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 카카오페이에서 받은 결제 페이지 URL 등 응답을 그대로 프론트로 전달
    res.status(200).json(apiResponse.data);
  } catch (err) {
    console.error('카카오페이 준비 오류:', err.response?.data || err.message);
    res.status(500).json({ error: '카카오페이 준비 실패' });
  }
});

// 2) 결제 성공 콜백
// GET /pay/success?userId=...&amount=...&tid=...
router.get('/success', async (req, res) => {
  try {
    const { userId, amount, tid } = req.query;

    // 2-1) 결제 기록 저장
    await UserPayment.create({
      users_id: userId,
      amount: parseInt(amount, 10),
      status: SUCCESS,
      paid_at: new Date(),
      // tid는 필요하다면 컬럼 추가 후 저장
    });

    // 2-2) 유저 balance 필드 업데이트
    await User.increment(
      { balance: parseInt(amount, 10) },
      { where: { id: userId } }
    );

    // 프론트의 성공 페이지로 리디렉션
    res.redirect('http://localhost:3000/pay/success-view');
  } catch (err) {
    console.error('결제 성공 처리 오류:', err);
    res.status(500).json({ error: '결제 성공 처리 실패' });
  }
});

// 3) 결제 취소 콜백
// GET /pay/cancel
router.get('/cancel', (req, res) => {
  // 프론트의 취소 페이지로 리디렉션
  res.redirect('http://localhost:3000/pay/cancel-view');
});

// 4) 결제 실패 콜백
// GET /pay/fail
router.get('/fail', (req, res) => {
  // 프론트의 실패 페이지로 리디렉션
  res.redirect('http://localhost:3000/pay/fail-view');
});

module.exports = router;
