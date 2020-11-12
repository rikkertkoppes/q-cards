import React from "react";

type Maybe<T> = T|null;

export function initMHub(url: string, pattern?: string) {
    //subscribe to receive messages
    const connect = () => {
        let ws = new WebSocket(url);

        ws.onopen = function() {
            ws.send(
                JSON.stringify({
                    type: "subscribe",
                    node: "default",
                    pattern
                })
            );
        };

        ws.onclose = connect;

        return ws;
    };

    return connect();
}

let nop = (data: any) => {};

export const useMHub = (
    url: string,
    topic: string
) => {
    let [ws, setWs] = React.useState<Maybe<WebSocket>>(null);
    let [send, setSend] = React.useState(() => nop);
    let [last, setLast] = React.useState(null);
    React.useEffect(() => {
        let ws = initMHub(url, topic);
        setWs(ws);
        return () => {
            ws && ws.close();
        };
    }, [url, topic]);


    React.useEffect(() => {
        if (!ws) return;
        const handleMessage = (msg: any) => {
            let data = JSON.parse(msg.data);
            setLast(data.data);
        };
        ws.addEventListener("message", handleMessage);
        setSend(
            () =>
                function(data: any) {
                    if (!ws) return;
                    if (ws.readyState === ws.OPEN) {
                        ws.send(
                            JSON.stringify({
                                type: "publish",
                                node: "default",
                                data: data,
                                topic,
                                headers: { keep: true }
                            })
                        );
                    }
                }
        );
        return () => {
            ws && ws.removeEventListener("message", handleMessage);
        };
    }, [ws, topic]);
    return [last, send];
};
