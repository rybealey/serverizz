import { redirect } from "next/navigation";
import { LEGAL_DOCS } from "@/lib/legal";

/** `/legal` has no page of its own — send visitors to the first document. */
export default function LegalIndex() {
  redirect(`/legal/${LEGAL_DOCS[0].slug}`);
}
