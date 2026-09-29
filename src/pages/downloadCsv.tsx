import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { downloadCsv } from "../lib/songTiming";

export default function Csv() {
  const navigate = useNavigate();

  useEffect(() => {
    downloadCsv();
    navigate({ to: "/" });
  }, [navigate]);

  return (
    <div>
      <div>ダウンロードしました。</div>
      <button onClick={() => navigate({ to: "/" })}>メインに戻るボタン</button>
    </div>
  );
}
