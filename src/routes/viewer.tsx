import { createFileRoute } from "@tanstack/react-router";

import Viewer from "../pages/Viewer";

export const Route = createFileRoute("/viewer")({
  component: Viewer,
});
