// 관리자 퀴즈 등록 페이지
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Form, Input,
  InputNumber, Button,
  Select, Radio, message
} from "antd";
import {
  REGISTER_QUIZ_REQUEST,
  RESET_QUIZ_FORM,
} from "../reducers/adminQuiz_GM";
import AppLayout from "../components/AppLayout";
import QuizRegisterForm from "../components/QuizRegisterForm";

const AdminQuizRegister = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { quizRegisterDone, quizRegisterError } = useSelector((state) => state.adminQuiz ?? {});
  const watchType = Form.useWatch("type", form);
  
  useEffect(() => {
    if (quizRegisterDone) {
      alert("퀴즈 등록 완료");
      form.resetFields();
      dispatch({ type: RESET_QUIZ_FORM });
      onSuccess?.();  // 성공 시 부모에게 알려줌
    }
  }, [quizRegisterDone]);
  
  useEffect(() => {
    if (quizRegisterError) {
      alert("퀴즈 등록 실패: " + quizRegisterError);
      dispatch({ type: RESET_QUIZ_FORM });
    }
  }, [quizRegisterError]);
  
  const onFinish = (values) => {
    alert("📝 등록 요청을 보냅니다.");
    
    const payload = {
      question: values.question,
      type: values.type,
      point_reward: values.point_reward,
    }
    
    if (values.type === "multiple") {
      payload.options = values.options.map((opt, index) => ({
        question_option: opt,
        answer: index === values.correctIndex ? 1 : 0,
      }));
    } else {
      payload.options = [
        {question_option: "O", answer: values.correctOX === "O" ? 1 : 0},
        {question_option: "X", answer: values.correctOX === "X" ? 1 : 0}
      ]
    }
    dispatch({ type: REGISTER_QUIZ_REQUEST, data: payload });
  }

  return(
    <AppLayout>
      <div style={{padding: "20px", boxSizing: "border-box"}}>
        <QuizRegisterForm />
      </div>
    </AppLayout>
  )
}

export default AdminQuizRegister;
