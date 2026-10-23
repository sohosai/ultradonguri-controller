import { createFileRoute } from "@tanstack/react-router";

import Csv from "../pages/Csv";

export const Route = createFileRoute("/csv")({
  component: Csv,
});
