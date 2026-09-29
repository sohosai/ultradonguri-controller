import { createFileRoute } from "@tanstack/react-router";

import Controller from "../pages/Controller";

export const Route = createFileRoute("/")({
  component: Controller,
});
