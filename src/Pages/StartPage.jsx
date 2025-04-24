import React, {useEffect} from "react";

export default function StartPage() {
    const getData = async () => {

        const res = await fetch(
            "https://jsonplaceholder.typicode.com/comments"
        ).then((res) => res.json());

        const initData = res.slice(0, 20).map((it) => {
            return {
                author: it.email,
                content: it.body,
                emotion: Math.floor(Math.random() * 5) + 1,
                created_date: new Date().getTime(),
                //id: dataId.current++,
            };
        });
        console.log(initData);
    };


    useEffect(() => {
        getData();
    }, []);

    const data = "데이터";

    return <h1>Start본문{data}</h1>;
}