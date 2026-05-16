import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export default function StudioContent() {
  return <NextStudio config={config} />;
}
