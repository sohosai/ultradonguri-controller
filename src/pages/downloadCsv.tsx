import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { downloadCsv } from "../lib/songTiming";

const STORAGE_KEY = "song-timing";

export default function Csv() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      alert("CSVのデータが存在しません。");
    } else {
      downloadCsv();
      navigate({ to: "/" });
    }
  }, [navigate]);

  return (
    <div>
      <button onClick={() => navigate({ to: "/" })}>メインに戻るボタン</button>
    </div>
  );
}
