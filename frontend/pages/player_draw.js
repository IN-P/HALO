import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, message } from 'antd';
import { DRAW_PLAYER_REQUEST, LOAD_DRAW_HISTROY_REQUEST } from '../reducers/playerDraw_GM';

const PlayerDrawPage = () => {
    const dispatch = useDispatch();
    const { drawResult, drawHistory } = useSelector((state) => state.playerDraw);

    const onDraw = () => {
        dispatch({type: DRAW_PLAYER_REQUEST, data: {users_id: 1, used_points: 10}})
    }

    useEffect(() => {
        dispatch({type: LOAD_DRAW_HISTROY_REQUEST, data: 1})
    }, []);

    useEffect(() => {
        if (drawResult?.drawn_player) {
            message.success(`${drawResult.drawn_player.player_name} 뽑기 성공! (${drawResult.drawn_player.rarity})`)
        }
    }, [drawResult]);

    return(
        <div style={{padding: 20}}>
            <h1>선수 뽑기</h1>
            <Button type="primary" onClick={onDraw}>10P 사용해 뽑기!</Button>

            {drawResult?.drawn_player && (
                <Card style={{marginTop: 20}}>
                    <img src={drawResult.drawn_player.image_url} width={100} alt="" /><br />
                    <strong>{drawResult.drawn_player.player_name}</strong> ({drawResult.drawn_player.rarity})
                </Card>
            )}

            <h2 style={{marginTop: 30}}>내 뽑기 기록</h2>
            {drawHistory.map((log) => (
                <Card key={log.id} style={{marginTop: 10}}>
                    {log.player_name} - {log.rarity} = {new Date(log.draw_time).toLocaleString()}
                </Card>
            ))}
        </div>
    )
}

export default PlayerDrawPage;