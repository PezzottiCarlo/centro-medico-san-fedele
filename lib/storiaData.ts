export interface StoriaEvento {
  anno: string
  titolo: string
  descrizione: string
  immagine?: string
}

export const STORIA_EVENTI: StoriaEvento[] = [
  {
    anno: "2008",
    titolo: "Fondazione",
    descrizione:
      "Il Centro Medico San Fedele apre le porte a Longone al Segrino con un piccolo team di medici specialisti, animato dalla missione di portare cure di eccellenza nel cuore della Provincia di Como.",
    immagine: "/images/storia/fondazione.jpg",
  },
  {
    anno: "2008",
    titolo: "Prima espansione",
    descrizione:
      "Apertura di nuovi ambulatori e ampliamento dell'offerta specialistica: fisioterapia, neurologia e oculistica si aggiungono alle discipline già presenti, raddoppiando la capacità di accoglienza.",
    immagine: "/images/storia/espansione.jpg",
  },
  {
    anno: "2011",
    titolo: "Nuovo reparto diagnostico",
    descrizione:
      "Introduzione di moderne apparecchiature per la diagnostica per immagini e gli esami di laboratorio, permettendo diagnosi rapide e precise direttamente in sede.",
    immagine: "/images/storia/diagnostica.jpg",
  },
  {
    anno: "2015",
    titolo: "Area DSA e neuropsichiatria",
    descrizione:
      "Apertura dell'area dedicata ai Disturbi Specifici dell'Apprendimento (DSA) e ai percorsi neuropsichiatrici per bambini e adolescenti, un servizio sempre più richiesto nel territorio.",
    immagine: "/images/storia/dsa.jpg",
  },
  {
    anno: "2018",
    titolo: "Convenzioni e reti territoriali",
    descrizione:
      "Consolidamento di un ampio network di convenzioni con enti pubblici, assicurazioni sanitarie e aziende, rendendo le prestazioni più accessibili a un'ampia platea di pazienti.",
    immagine: "/images/storia/convenzioni.jpg",
  },
  {
    anno: "2021",
    titolo: "Digitalizzazione e telemedicina",
    descrizione:
      "Lancio del portale online di prenotazione e delle prime visite in telemedicina, per garantire continuità di cura anche nei periodi di emergenza sanitaria.",
    immagine: "/images/storia/telemedicina.jpg",
  },
  {
    anno: "2024",
    titolo: "Vent'anni di eccellenza",
    descrizione:
      "Celebrazione del ventesimo anniversario con oltre 50.000 pazienti assistiti, 30+ specialisti e 80+ specialistiche erogate. Il futuro del centro è orientato alla ricerca, alla prevenzione e all'innovazione.",
    immagine: "/images/storia/ventennale.jpg",
  },
]

export interface Riconoscimento {
  titolo: string
  anno: string
  descrizione: string
}

export const RICONOSCIMENTI: Riconoscimento[] = [
  {
    titolo: "Record del Mondo",
    anno: "2019",
    descrizione: "Riconoscimento per l'eccellenza nei trattamenti riabilitativi sportivi.",
  },
  {
    titolo: "Premio Eccellenza Sanitaria",
    anno: "2022",
    descrizione: "Premiati dalla Regione Lombardia per la qualità dei servizi offerti al territorio.",
  },
  {
    titolo: "Centro di Riferimento DSA",
    anno: "2023",
    descrizione: "Riconosciuti come centro di riferimento per la diagnosi e il trattamento dei Disturbi Specifici dell'Apprendimento.",
  },
]
