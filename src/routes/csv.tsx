import { createFileRoute } from "@tanstack/react-router";

import Csv from "../pages/downloadCsv";

export const Route = createFileRoute("/csv")({
  component: Csv,
});
