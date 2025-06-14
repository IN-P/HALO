// 관리자 퀴즈 등록 페이지
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";  // ##
import {
  Form, Input, InputNumber, Button, Select, Radio, message
} from "antd";
import {
  REGISTER_QUIZ_REQUEST,
  RESET_QUIZ_FORM,
} from "../reducers/adminQuiz_GM";

const QuizRegisterForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();  // ##
  const [form] = Form.useForm();
  const { quizRegisterDone, quizRegisterError } = useSelector((state) => state.adminQuiz ?? {});
  const watchType = Form.useWatch("type", form);
  
  useEffect(() => {
    if (quizRegisterDone) {
      alert("퀴즈 등록 완료");
      form.resetFields();
      dispatch({ type: RESET_QUIZ_FORM });
    }
  }, [quizRegisterDone]);
  
  useEffect(() => {
    if (quizRegisterError) {
      alert("퀴즈 등록 실패: " + quizRegisterError);
      dispatch({ type: RESET_QUIZ_FORM });
    }
  }, [quizRegisterError]);
  
  const onFinish = (values) => {
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
    message.success("퀴즈 등록 완료");
    router.push("/admin/quiz");
  }

  return(
    <div style={{maxWidth: 600, margin: '2rem auto'}}>
      <h1>🛠️ 퀴즈 등록(관리자 페이지)</h1>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="question" label="문제" rules={[{required: true}]}>
          <Input />
        </Form.Item>

        <Form.Item name="type" label="유형" rules={[{required: true}]}>
          <Select>
            <Select.Option value="multiple">객관식</Select.Option>
            <Select.Option value="ox">OX</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="point_reward" label="포인트" rules={[{required: true}]}>
          <InputNumber min={1} />
        </Form.Item>

        {/* 객관식 퀴즈 */}
        {watchType === "multiple" && (
          <>
            <Form.List name="options">
              {(fields, {add, remove}) => (
                <>
                  <Form.Item label="선택지">
                    <Button onClick={() => add()}>선택지 추가</Button>
                  </Form.Item>
                  {fields.map((field, index)=> (
                    <Form.Item
                      key={field.key}
                      label={`선택지 ${index + 1}`}
                      name={[field.name]}
                      rules={[{required: true, message: "선택지를 입력하세요"}]}
                    >
                      <Input />
                    </Form.Item>
                  ))}
                </>
              )}
            </Form.List>

            <Form.Item
              name="correctIndex"
              label="정답 인덱스 (0부터 시작)"
              rules={[{required: true}]}
            >
              <InputNumber min={0} />
            </Form.Item>
          </>
        )}

        {/* OX 퀴즈 */}
        {watchType === "ox" && (
          <Form.Item
            name="correctOX"
            label="정답 (OX)"
            rules={[{required: true}]}
          >
            <Radio.Group>
              <Radio.Button value="O">O</Radio.Button>
              <Radio.Button value="X">X</Radio.Button>
            </Radio.Group>
          </Form.Item>
        )}

        <Button htmlType="submit" type="primary" style={{marginTop: 20}}>
            등록하기
        </Button>
      </Form>
    </div>
  )
}

export default QuizRegisterForm;