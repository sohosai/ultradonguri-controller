import { createFileRoute } from "@tanstack/react-router";

import csv from "../pages/downloadCsv";

export const Route = createFileRoute("/csv")({
  component: csv,
});
