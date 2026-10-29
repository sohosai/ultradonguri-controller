import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { downloadCsv } from "../lib/songTiming";

export default function Csv() {
  const navigate = useNavigate();
  const executed = useRef(false);

  useEffect(() => {
    if (executed.current) return;

    executed.current = true;

    downloadCsv();
    navigate({ to: "/" });
  }, [navigate]);

  return (
    <div>
      <button onClick={() => navigate({ to: "/" })}>メインに戻るボタン</button>
    </div>
  );
}
