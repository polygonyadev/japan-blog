import { getLessons, getVokabeln, getKanji, getGrammatik, getPartikel, getSaetze, getNotizen } from "@/lib/fetchData";
import JapanischClient from "./JapanischClient";

export default async function JapanischPage() {
  const [lessons, vokabeln, kanji, grammatik, partikel, saetze, notizen] = await Promise.all([
    getLessons(), getVokabeln(), getKanji(), getGrammatik(), getPartikel(), getSaetze(), getNotizen(),
  ]);
  return (
    <JapanischClient
      lessons={lessons}
      vokabeln={vokabeln}
      kanji={kanji}
      grammatik={grammatik}
      partikel={partikel}
      saetze={saetze}
      notizen={notizen}
    />
  );
}
