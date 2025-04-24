import React, { useEffect, useState } from "react";

export default function Page01() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://jsonplaceholder.typicode.com/comments");
                const json = await response.json();

                const initData = [];
                const sliced = json.slice(0, 20);

                for (let i = 0; i < sliced.length; i++) {
                    const item = sliced[i];
                    initData.push({
                        author: item.email,
                        content: item.body,
                        emotion: Math.floor(Math.random() * 5) + 1,
                        created_date: Date.now(),
                    });
                }

                setData(initData);
            } catch (error) {
                console.error("데이터 가져오기 실패:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>데이터 가져오기1</h1>
            <h2>데이터 개수: {data.length}</h2>
            <ul>
                {data.map((item, index) => (
                    <li key={index}>
                        <strong>{item.author}</strong>: {item.content}
                    </li>
                ))}
            </ul>
        </div>
    );
}