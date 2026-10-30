import { createFileRoute } from "@tanstack/react-router";

import ControllerLock from "../components/ControllerLock";
import Controller from "../pages/Controller";

export const Route = createFileRoute("/")({
  component: () => (
    <ControllerLock>
      <Controller />
    </ControllerLock>
  ),
});
