// pages/adminQuiz/[id].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, InputNumber, Button, Select, Radio, message } from 'antd';
import axios from 'axios';
import AppLayout from '../../components/AppLayout';

const AdminQuizEditPage = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const { id } = router.query;

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    // 퀴즈 불러오기
    useEffect(() => {
        if (!id) return;
        const fetchQuiz = async () => {
            try {
                const res = await axios.get(`/event/quizzes/${id}`);
                const q = res.data;
                const options = q.QuizOptions.map((opt) => opt.question_option);
                const correctIndex = q.QuizOptions.findIndex((opt) => opt.answer === 1);
                form.setFieldValue({
                    question: q.question,
                    point_reward: point_reward,
                    type: q.type,
                    options,
                    correctIndex,
                    correctOX: q.QuizOptions[correctIndex]?.question_option,
                });
                setQuiz(q);
            } catch (err) {
                message.error("퀴즈 불러오기 실패");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    const watchType = Form.useWatch("type", form);

    const onFinish = async (values) => {
        try {
            const payload = {
                question: values.question,
                point_reward: values.point_reward,
                type: values.type,
                options:
                    values.type === "multiple"
                    ? values.options.map((opt, index) => ({
                        question_option: opt,
                        answer: index === values.correctIndex ? 1 : 0,
                    }))
                    : [
                        {question_option: "O", answer: values.correctOX === "O" ? 1 : 0},
                        {question_option: "X", answer: values.correctOX === "X" ? 1 : 0},
                    ],
            };

            await axios.put(`/event/admin/quizzes/${id}`, payload);
            message.success("퀴즈 수정 완료");
            router.push("/adminQuizList");
        } catch (err) {
            message.error("수정 실패");
        }
    };

    if (loading) return <p>로딩 중...</p>;
    if (!quiz) return <p>퀴즈를 찾을 수 없습니다</p>;

    return (
        <AppLayout>
            <div style={{maxWidth: 600, margin: '2rem auto'}}>
                <h1>✏️ 퀴즈 수정</h1>
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

                    {watchType === "multiple" && (
                        <>
                            <Form.List name="options">
                                {(fields, {add, remove}) => (
                                    <>
                                        <Form.Item label="선택지">
                                            <Button onClick={() => add()}>선택지 추가</Button>
                                        </Form.Item>
                                        {fields.map((field, index) => (
                                            <Form.Item
                                                key={field.key}
                                                label={`선택지 ${index + 1}`}
                                                name={[field.name]}
                                                rules={[{required: true}]}
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
                    
                    {watchType === "ox" && (
                        <Form.Item name="correctOX" label="정답 (OX)" rules={[{required: true}]}>
                            <Radio.Group>
                                <Radio.Button value="O">O</Radio.Button>
                                <Radio.Button value="X">X</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    )}

                    <Button htmlType="submit" type="primary" style={{marginTop: 20}}>
                        수정 완료
                    </Button>
                </Form>
            </div>
        </AppLayout>
    );
};

export default AdminQuizEditPage;