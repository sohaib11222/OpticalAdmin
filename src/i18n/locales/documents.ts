import type { LocaleModule } from "../types";

const en = {
  "documents.panelDocuments": "Documents and private files",
  "documents.panelImports": "Customer file imports",
  "documents.batchesPanel": "Import batches",

  "documents.uploadDocument": "Upload document",
  "documents.uploadSheet": "Upload CSV / Excel",
  "documents.download": "Download",
  "documents.preview": "Preview",
  "documents.importCustomers": "Import customers",
  "documents.editDetails": "Edit details",
  "documents.restore": "Restore",
  "documents.archive": "Archive",
  "documents.retryScan": "Retry scan",
  "documents.reviewImport": "Review import",
  "documents.closeImport": "Close import",
  "documents.mapColumns": "Map columns and preview",
  "documents.sheetDelimiter": "Sheet / delimiter",
  "documents.commitImport": "Commit reviewed import",
  "documents.retryProcessing": "Retry processing",
  "documents.reviewDecision": "Review decision",

  "documents.pipelineNote":
    "Upload → security scan → ready. Customer files then need column mapping, duplicate review and import confirmation.",
  "documents.importIntro":
    "Choose a clean CSV or XLSX file below and select Import customers. Uploading a file alone does not create customers.",
  "documents.helpOpticalRecord":
    "Required for glasses images; must match the selected customer.",
  "documents.helpColumnMapping":
    "Map each source column once. First and last name are required. Remapping resets earlier decisions.",
  "documents.overwriteBlanks":
    "Explicitly overwrite existing values with blank source values",
  "documents.fileLabel": "File (up to 10 MB)",
  "documents.pickerCustomer":
    "Customer (optional for general documents)",
  "documents.chooseFile": "Choose a file.",

  "documents.searchAria": "Search documents",
  "documents.searchPlaceholder": "Search document title",
  "documents.scanFilterLabel": "File scan status",
  "documents.scanAll": "All scan states",
  "documents.archivedOnly": "Archived",
  "documents.rowStatusLabel": "Import row status",
  "documents.allRows": "All rows",

  "documents.scanState.pending": "pending",
  "documents.scanState.clean": "clean",
  "documents.scanState.failed": "failed",
  "documents.scanState.rejected": "rejected",

  "documents.category.document": "document",
  "documents.category.customer_image": "customer image",
  "documents.category.glasses_image": "glasses image",

  "documents.delimiter.comma": "Comma",
  "documents.delimiter.semicolon": "Semicolon",
  "documents.delimiter.tab": "Tab",
  "documents.delimiter.pipe": "Pipe",

  "documents.dateFormat.Y-m-d": "YYYY-MM-DD",
  "documents.dateFormat.d/m/Y": "DD/MM/YYYY",
  "documents.dateFormat.m/d/Y": "MM/DD/YYYY",
  "documents.dateFormat.excel": "Excel serial date",

  "documents.rowState.pending": "pending",
  "documents.rowState.error": "error",
  "documents.rowState.created": "created",
  "documents.rowState.updated": "updated",
  "documents.rowState.skipped": "skipped",

  "documents.decision.pending": "pending",
  "documents.decision.create": "create",
  "documents.decision.create_distinct": "create distinct",
  "documents.decision.update": "update",
  "documents.decision.skip": "skip",

  "documents.action.create": "Create customer",
  "documents.action.create_distinct":
    "Create a distinct customer after review",
  "documents.action.update": "Update a matching customer",
  "documents.action.skip": "Skip this row",

  "documents.stage.parse": "parse",
  "documents.stage.preview": "preview",
  "documents.stage.commit": "commit",

  "documents.headerFile": "File",
  "documents.headerLinks": "Links",
  "documents.headerState": "State",
  "documents.headerActions": "Actions",
  "documents.headerBatch": "Batch / source",
  "documents.headerStage": "Stage",
  "documents.headerProgress": "Progress",
  "documents.headerRow": "Row",
  "documents.headerRowValues": "Customer / source values",
  "documents.headerValidation": "Validation / duplicates",
  "documents.headerDecision": "Decision / result",

  "documents.customerRef": "· customer #{id}",
  "documents.recordRef": "· clinical record #{id}",
  "documents.matchLabel": "Match #{id}",
  "documents.resultCustomer": "→ customer #{id}",
  "documents.duplicateInFile": "Duplicate in this file",
  "documents.vistaContacts": "Vista Express contacts",
  "documents.processedOf": "{processed} / {total} processed",
  "documents.rowsUndecided": "{count} rows still need a decision.",

  "documents.uploadTitleDocument": "Upload private document",
  "documents.uploadTitleImports": "Upload customer file",
  "documents.startImport": "Start customer import",
  "documents.restoreTitle": "Restore document",
  "documents.archiveTitle": "Archive document",
  "documents.editDetailsTitle": "Edit document details",
  "documents.importTitle": "Import #{id}",
  "documents.columnMapping": "Column mapping",
  "documents.sourceSheetTitle": "Source sheet and delimiter",
  "documents.reviewRow": "Review row {row}",


  "status.mapping": "mapping",
  "status.parsing": "parsing",
  "status.previewing": "previewing",
  "status.committing": "committing",
  "status.created": "created",
  "status.updated": "updated",
  "status.skipped": "skipped",
  "status.error": "error",
};

const it = {
  "documents.panelDocuments": "Documenti e file riservati",
  "documents.panelImports": "Importazioni di file clienti",
  "documents.batchesPanel": "Lotti di importazione",

  "documents.uploadDocument": "Carica documento",
  "documents.uploadSheet": "Carica CSV / Excel",
  "documents.download": "Scarica",
  "documents.preview": "Anteprima",
  "documents.importCustomers": "Importa clienti",
  "documents.editDetails": "Modifica dettagli",
  "documents.restore": "Ripristina",
  "documents.archive": "Archivia",
  "documents.retryScan": "Riprova la scansione",
  "documents.reviewImport": "Rivedi l'importazione",
  "documents.closeImport": "Chiudi l'importazione",
  "documents.mapColumns": "Associa le colonne e mostra l'anteprima",
  "documents.sheetDelimiter": "Foglio / separatore",
  "documents.commitImport": "Conferma l'importazione rivista",
  "documents.retryProcessing": "Riprova l'elaborazione",
  "documents.reviewDecision": "Rivedi la decisione",

  "documents.pipelineNote":
    "Caricamento → analisi di sicurezza → pronto. I file dei clienti richiedono poi l'associazione delle colonne, la revisione dei duplicati e la conferma dell'importazione.",
  "documents.importIntro":
    "Scegli qui sotto un file CSV o XLSX pulito e seleziona Importa clienti. Il solo caricamento di un file non crea clienti.",
  "documents.helpOpticalRecord":
    "Obbligatorio per le immagini degli occhiali; deve corrispondere al cliente selezionato.",
  "documents.helpColumnMapping":
    "Associa ogni colonna di origine una sola volta. Nome e cognome sono obbligatori. Una nuova associazione azzera le decisioni già prese.",
  "documents.overwriteBlanks":
    "Sovrascrivi esplicitamente i valori esistenti con quelli vuoti presenti nel file di origine",
  "documents.fileLabel": "File (fino a 10 MB)",
  "documents.pickerCustomer":
    "Cliente (facoltativo per i documenti generici)",
  "documents.chooseFile": "Scegli un file.",

  "documents.searchAria": "Cerca documenti",
  "documents.searchPlaceholder": "Cerca il titolo del documento",
  "documents.scanFilterLabel": "Stato della scansione del file",
  "documents.scanAll": "Tutti gli stati della scansione",
  "documents.archivedOnly": "Archiviati",
  "documents.rowStatusLabel": "Stato della riga di importazione",
  "documents.allRows": "Tutte le righe",

  "documents.scanState.pending": "in attesa",
  "documents.scanState.clean": "pulito",
  "documents.scanState.failed": "non riuscita",
  "documents.scanState.rejected": "rifiutato",

  "documents.category.document": "documento",
  "documents.category.customer_image": "immagine cliente",
  "documents.category.glasses_image": "immagine occhiali",

  "documents.delimiter.comma": "Virgola",
  "documents.delimiter.semicolon": "Punto e virgola",
  "documents.delimiter.tab": "Tabulazione",
  "documents.delimiter.pipe": "Barra verticale",

  "documents.dateFormat.Y-m-d": "AAAA-MM-GG",
  "documents.dateFormat.d/m/Y": "GG/MM/AAAA",
  "documents.dateFormat.m/d/Y": "MM/GG/AAAA",
  "documents.dateFormat.excel": "Data seriale Excel",

  "documents.rowState.pending": "in attesa",
  "documents.rowState.error": "errore",
  "documents.rowState.created": "creato",
  "documents.rowState.updated": "aggiornato",
  "documents.rowState.skipped": "saltato",

  "documents.decision.pending": "in attesa",
  "documents.decision.create": "creazione",
  "documents.decision.create_distinct": "creazione distinta",
  "documents.decision.update": "aggiornamento",
  "documents.decision.skip": "salta",

  "documents.action.create": "Crea cliente",
  "documents.action.create_distinct":
    "Crea un cliente distinto dopo la revisione",
  "documents.action.update": "Aggiorna un cliente corrispondente",
  "documents.action.skip": "Salta questa riga",

  "documents.stage.parse": "lettura",
  "documents.stage.preview": "anteprima",
  "documents.stage.commit": "conferimento",

  "documents.headerFile": "File",
  "documents.headerLinks": "Collegamenti",
  "documents.headerState": "Stato",
  "documents.headerActions": "Azioni",
  "documents.headerBatch": "Lotto / origine",
  "documents.headerStage": "Fase",
  "documents.headerProgress": "Avanzamento",
  "documents.headerRow": "Riga",
  "documents.headerRowValues": "Valori cliente / origine",
  "documents.headerValidation": "Validazione / duplicati",
  "documents.headerDecision": "Decisione / risultato",

  "documents.customerRef": "· cliente #{id}",
  "documents.recordRef": "· record clinico #{id}",
  "documents.matchLabel": "Corrispondenza #{id}",
  "documents.resultCustomer": "→ cliente #{id}",
  "documents.duplicateInFile": "Duplicato all'interno di questo file",
  "documents.vistaContacts": "Contatti Vista Express",
  "documents.processedOf": "{processed} / {total} elaborate",
  "documents.rowsUndecided":
    "{count} righe richiedono ancora una decisione.",

  "documents.uploadTitleDocument": "Carica un documento riservato",
  "documents.uploadTitleImports": "Carica un file clienti",
  "documents.startImport": "Avvia l'importazione clienti",
  "documents.restoreTitle": "Ripristina il documento",
  "documents.archiveTitle": "Archivia il documento",
  "documents.editDetailsTitle": "Modifica i dettagli del documento",
  "documents.importTitle": "Importazione #{id}",
  "documents.columnMapping": "Associazione delle colonne",
  "documents.sourceSheetTitle": "Foglio di origine e separatore",
  "documents.reviewRow": "Rivedi la riga {row}",


  "status.mapping": "in mappatura",
  "status.parsing": "in analisi",
  "status.previewing": "in anteprima",
  "status.committing": "in conferimento",
  "status.created": "creato",
  "status.updated": "aggiornato",
  "status.skipped": "saltato",
  "status.error": "errore",
};

export default { en, it } satisfies LocaleModule;