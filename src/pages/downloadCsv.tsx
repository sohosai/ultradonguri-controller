import { useNavigate } from "@tanstack/react-router";
import { downloadCsv } from "../lib/songTiming";
import { useEffect } from "react";

export default function csv() {
    
    const navigate = useNavigate();

    useEffect(() => {
        downloadCsv();
        navigate({ to: "/", })
    }, [navigate]);

    return (
        <div>
            <div>ダウンロードしました。</div>
            <button onClick={() => navigate({ to: "/", })}>メインに戻るボタン</button>
        </div>
    );
}
