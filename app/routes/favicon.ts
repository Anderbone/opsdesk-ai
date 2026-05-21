import type { LoaderFunctionArgs } from "react-router";

export function loader({ request }: LoaderFunctionArgs) {
  return Response.redirect(new URL("/favicon.svg", request.url), 302);
}
