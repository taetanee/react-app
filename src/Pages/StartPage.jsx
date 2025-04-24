import React, { useEffect, useState } from "react";

export default function StartPage() {
    const [data, setData] = useState([]); // 데이터 저장용 상태

    const getData = async () => {
        const res = await fetch(
            "https://jsonplaceholder.typicode.com/comments"
        ).then((res) => res.json());

        const initData = res.slice(0, 20).map((it) => ({
            author: it.email,
            content: it.body,
            emotion: Math.floor(Math.random() * 5) + 1,
            created_date: new Date().getTime(),
        }));

        setData(initData);
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div>
            <h1>Start본문</h1>
            <h2>데이터 수 : {data.length}</h2>

            {/* 데이터 리스트 보여주기 예시 */}
            <ul>
                {data.map((item, idx) => (
                    <li key={idx}>
                        <b>{item.author}</b>: {item.content}
                    </li>
                ))}
            </ul>
        </div>
    );
}
