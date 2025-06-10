import React, { useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { REGISTER_PLAYER_REQUEST, RESET_PLAYER_FORM } from '../reducers/adminPlayer_GM';

const AdminPlayerRegister = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { playerRegisterDone } = useSelector((state) => state.adminPlayer);

    useEffect(() => {
        if (playerRegisterDone) {
            message.success('선수 등록 완료');
            form.resetFields();
            dispatch({type: RESET_PLAYER_FORM});
        }
    }, [playerRegisterDone]);

    const onFinish = (values) => {
        dispatch({type: REGISTER_PLAYER_REQUEST, data: values});
    }

    return (
        <div style={{maxWidth: 600, margin: '2rem auto'}}>
            <h1>선수 등록</h1>
            <Form layout='vertical' form={form} onFinish={onFinish}>
                <Form.Item name="name" label="이름" rules={[{required: true}]}>
                    <Input />
                </Form.Item>

                <Form.Item name="rarity" label="희귀도" rules={[{required: true}]}>
                    <Select>
                        <Select.Option value="NORMAL">NORMAL</Select.Option>
                        <Select.Option value="RARE">RARE</Select.Option>
                        <Select.Option value="LEGEND">LEGEND</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item name="image_url" label="이미지 URL" rules={[{required: true}]}>
                    <Input />
                </Form.Item>

                <Button htmlType="submit" type="primary">등록</Button>
            </Form>
        </div>
    )
}

export default AdminPlayerRegister;